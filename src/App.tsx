import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Effect, Layer, pipe } from "effect";
import { ErrorOfReadingFile, ReadFileService } from "./ReadFileService";
import { ErrorOfLoadingImage, LoadImageService } from "./LoadFileService";

type ImageSize = { width: number; height: number };
type FileStatus =
  | { _tag: "NotSelected" }
  | { _tag: "NotImage" }
  | { _tag: "FileError" }
  | { _tag: "Selected"; size: ImageSize };

const ReadFileLive = Layer.succeed(
  ReadFileService,
  ReadFileService.of((file: File) =>
    Effect.tryPromise({
      try: () => {
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      },
      catch: (_) => new ErrorOfReadingFile(),
    }),
  ),
);

const LoadImageLive = Layer.succeed(
  LoadImageService,
  LoadImageService.of((dataUrl: string) =>
    Effect.tryPromise({
      try: () => {
        const img = new Image();
        return new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = dataUrl;
        });
      },
      catch: (_) => new ErrorOfLoadingImage(),
    }),
  ),
);

const getImageSize = <T extends ImageSize>({
  width,
  height,
}: T): ImageSize => ({ width, height });

const programOfGetImageSize = (file: File) =>
  pipe(
    Effect.all([ReadFileService, LoadImageService]),
    Effect.flatMap(([ReadFile, LoadImage]) =>
      pipe(
        Effect.succeed(file),
        Effect.flatMap(ReadFile),
        Effect.flatMap(LoadImage),
        Effect.map(getImageSize),
      ),
    ),
  );

function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<FileStatus>({ _tag: "NotSelected" });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file === undefined) {
      setStatus({ _tag: "NotSelected" });
      return;
    }

    const program = programOfGetImageSize(file).pipe(
      // 이미지 변환 성공시 status로 인코딩
      Effect.map((size) => ({ _tag: "Selected", size } as const)),
      // 에러를 status로 인코딩
      Effect.catchTags({
        ErrorOfReadingFile: () =>
          Effect.succeed({ _tag: "FileError" } as const),
        ErrorOfLoadingImage: () =>
          Effect.succeed({ _tag: "NotImage" } as const),
      }),
    );

    const runnable: Effect.Effect<never, never, FileStatus> =
      Effect.provideLayer(program, Layer.merge(ReadFileLive, LoadImageLive));

    const result = await Effect.runPromise(runnable);

    setStatus(result);
  };

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div>
        {status._tag === "NotSelected" && "파일이 선택되지 않았습니다."}
        {status._tag === "NotImage" && "이미지 파일이 아닙니다."}
        {status._tag === "FileError" && "파일을 읽는 중에 에러가 발생했습니다."}
        {status._tag === "Selected" &&
          `이미지 크기: ${status.size.width}x${status.size.height}`}
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
