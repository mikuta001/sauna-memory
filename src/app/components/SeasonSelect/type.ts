export type Season = "spring" | "summer" | "autumn" | "winter";

export type SeasonSelectProps = {
  value: Season | null;
  onChange: (value: Season | null) => void;
};
