export type SaunaOption = { id: string; name: string };

export type SaunaComboboxProps = {
  label: string;
  hideLabel?: boolean;
  options: SaunaOption[];
  value: string | null;
  onChange: (saunaId: string | null) => void;
};
