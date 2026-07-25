import RatingStars from "../RatingStars";
import type { RecordCardHeaderProps } from "./type";

const RecordCardHeader = ({ title, rating }: RecordCardHeaderProps) => {
  return (
    <div className="flex justify-between items-end border-b-1 border-gray-300">
      <h2 className="text-xl text-[var(--black)] font-medium">{title}</h2>
      <div className="flex items-center gap-1">
        <div>
          <RatingStars rating={rating} />
        </div>
        <p className="text-base text-yellow-600">{rating}</p>
      </div>
    </div>
  );
};

export default RecordCardHeader;
