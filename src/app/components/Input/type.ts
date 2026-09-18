import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input"> & {
  label: string;
  errorMessage?: string;
};
