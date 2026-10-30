export type RecordCardProps = {
  id: number;
  title: string;
  rating: number;
  body: string;
  imageSrc?: string[];
  tagNames: string[];
  href?: string;
};

export type RecordCardHeaderProps = {
  title: string;
  rating: number;
};

export type DeleteVisitButtonProps = {
  visitId: number;
};
