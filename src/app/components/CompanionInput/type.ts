export type Companion = {
  id: string;
  name: string;
};

export type CompanionInputProps = {
  companions: Companion[];
  onChange: (companions: Companion[]) => void;
};
