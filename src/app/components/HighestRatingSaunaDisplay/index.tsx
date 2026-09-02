import { HighestRatingSaunaDisplayProps } from "./type";
import Image from "next/image";
import { Star } from "lucide-react";

const formatVisitedDate = (visitedAt: string) => {
  const date = new Date(visitedAt);

  if (Number.isNaN(date.getTime())) {
    return visitedAt;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
  }).format(date);
};

const HighestRatingSaunaDisplay = ({
  records,
}: HighestRatingSaunaDisplayProps) => {
  if (records.length === 0) {
    return (
      <p className="animate-[visit-summary-rise_1200ms_ease-out] text-sm text-[rgba(85,85,85,0.75)]">
        評価したサ活はありませんでした。
      </p>
    );
  }

  return (
    <section
      aria-label="高評価のサウナ記録"
      className="animate-[visit-summary-rise_1200ms_ease-out]"
    >
      <ul className="grid gap-3 md:grid-cols-2">
        {records.map((record) => (
          <li
            key={record.id}
            className="flex min-h-44 overflow-hidden border border-gray-100 bg-[color:var(--white)] shadow-sm sm:min-h-48"
          >
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3">
              <p className="line-clamp-2 text-base font-bold text-[var(--black)]">
                {record.name}
              </p>
              <div className="flex items-center gap-1 text-yellow-600">
                <Star
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                  strokeWidth={2}
                />
                <p className="text-base font-medium">{record.rating}</p>
              </div>
              <p className="text-sm text-[rgba(85,85,85,0.65)]">
                ({formatVisitedDate(record.visitedAt)})
              </p>
            </div>

            {record.imagePath ? (
              <div className="relative w-[45%] shrink-0 bg-gray-100">
                <Image
                  src={record.imagePath}
                  alt={`${record.name}の添付画像`}
                  fill
                  sizes="(min-width: 768px) 23vw, 45vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HighestRatingSaunaDisplay;
