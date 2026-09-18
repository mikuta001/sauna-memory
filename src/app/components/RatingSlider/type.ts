export type RatingSliderProps = {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
  errorMessage?: string;
};
