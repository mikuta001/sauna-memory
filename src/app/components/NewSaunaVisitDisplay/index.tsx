import Image from "next/image";
import type { NewSaunaVisitDisplayProps } from "./type";

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

const NewSaunaVisitDisplay = ({ visits }: NewSaunaVisitDisplayProps) => {
  if (visits.length === 0) {
    return (
      <p className="animate-[visit-summary-rise_1200ms_ease-out] text-sm text-[rgba(85,85,85,0.75)]">
        初めて訪問したサウナはありませんでした。
      </p>
    );
  }

  const sortedVisits = [...visits].sort((a, b) => {
    return new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime();
  });

  return (
    <section
      aria-label="初めて訪問したサウナ施設"
      className="animate-[visit-summary-rise_1200ms_ease-out]"
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {sortedVisits.map((visit) => (
          <li
            key={visit.id}
            className="overflow-hidden border border-gray-100 bg-[color:var(--white)] shadow-sm"
          >
            <div className="relative aspect-[4/3] w-full bg-gray-100">
              {visit.imageUrl ? (
                <Image
                  src={visit.imageUrl}
                  alt={`${visit.name}の施設画像`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[rgba(85,85,85,0.55)]">
                  No image
                </div>
              )}
            </div>
            <div className="min-w-0 p-3">
              <p className="line-clamp-2 text-base font-bold text-[var(--black)]">
                {visit.name}
              </p>
              <p className="mt-1 text-sm text-[rgba(85,85,85,0.65)]">
                {formatVisitedDate(visit.visitedAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default NewSaunaVisitDisplay;
