export type Season = "spring" | "summer" | "autumn" | "winter";

export type SeasonSelectProps = {
  disabled?: boolean;
  value: Season | null;
  onChange: (value: Season | null) => void;
};
