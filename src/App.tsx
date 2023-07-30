import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

type ImageSize = { width: number; height: number };
type FileStatus =
  | { _tag: "NotSelected" }
  | { _tag: "NotImage" }
  | { _tag: "FileError" }
  | { _tag: "Selected"; size: ImageSize };

function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<FileStatus>({ _tag: "NotSelected" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file === undefined) {
      setStatus({ _tag: "NotSelected" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const img = new Image();
      img.onload = () => {
        setStatus({
          _tag: "Selected",
          size: { width: img.width, height: img.height },
        });
      };
      img.onerror = () => {
        setStatus({ _tag: "NotImage" });
      };
      img.src = text as string;
    };
    reader.onerror = () => {
      setStatus({ _tag: "FileError" });
    };
    reader.readAsDataURL(file);
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
