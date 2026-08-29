export type NewSaunaVisit = {
  id: string;
  name: string;
  imageUrl: string | null;
  visitedAt: string;
};

export type NewSaunaVisitDisplayProps = {
  visits: NewSaunaVisit[];
};
