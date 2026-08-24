import { ComponentProps } from "react";

export type SelectedYear = number | 'all';

export type YearSelectProps = Omit<ComponentProps<"select">, "value" | "onChange"> & {
  firstRecordedYear: number;
  value: SelectedYear;
  onChange: (value : SelectedYear) => void;
};
