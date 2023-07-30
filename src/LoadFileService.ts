import { Context, Effect } from "effect";

export class ErrorOfLoadingImage {
  readonly _tag = "ErrorOfLoadingImage";
}

export type LoadImageService = (
  dataUrl: string,
) => Effect.Effect<never, ErrorOfLoadingImage, HTMLImageElement>;

export const LoadImageService = Context.Tag<LoadImageService>();
