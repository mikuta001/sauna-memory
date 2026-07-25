import type { RatingStarsProps } from "./type";
import { MAX_RATING } from "@/app/constants/rating";

const HalfStar = () => {
  return (
    <span className="relative">
      ☆<span className="absolute left-0 top-0 w-1/2 overflow-hidden">★</span>
    </span>
  );
};

const RatingStars = ({ rating }: RatingStarsProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex text-yellow-600">
      {Array.from({ length: MAX_RATING }).map((_, index) => {
        const starNumber = index + 1;

        if (starNumber <= fullStars) {
          return <span key={starNumber}>★</span>;
        }

        if (starNumber === fullStars + 1 && hasHalfStar) {
          return <HalfStar key={starNumber} />;
        }

        return <span key={starNumber}>☆</span>;
      })}
    </div>
  );
};

export default RatingStars;
