export type Comparison = {
  label: string;
  visitCount: number;
};

export type VisitSummaryDisplayProps = {
  periodLabel: string;
  visitCount: number;
  comparison: Comparison | null;
};
