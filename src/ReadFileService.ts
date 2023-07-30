import { Context, Effect } from "effect";

export class ErrorOfReadingFile {
  readonly _tag = "ErrorOfReadingFile";
}

export type ReadFileService = (
  file: File,
) => Effect.Effect<never, ErrorOfReadingFile, string>;

export const ReadFileService = Context.Tag<ReadFileService>();
