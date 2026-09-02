export type HighestRatingSaunaRecord = {
  id: string;
  name: string;
  rating: number;
  visitedAt: string;
  imagePath: string | null;
};


export type HighestRatingSaunaDisplayProps = {
  records: HighestRatingSaunaRecord[];
};
