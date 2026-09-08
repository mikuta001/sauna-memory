export type SaunaOption = { id: string; name: string };

export type SaunaComboboxProps = {
  label: string;
  options: SaunaOption[];
  value: string | null;
  onChange: (saunaId: string | null) => void;
};
