import { VisitSummaryDisplayProps } from "./type";

const VisitSummaryDisplay = ({
  periodLabel,
  visitCount,
  comparison,
}: VisitSummaryDisplayProps) => {
  const comparisonText = (() => {
    if (!comparison) {
      return null;
    }

    const visitCountDifference = visitCount - comparison.visitCount;

    if (visitCountDifference > 0) {
      return `${comparison.label}より${visitCountDifference}回多いです。`;
    }

    if (visitCountDifference < 0) {
      return `${comparison.label}より${Math.abs(visitCountDifference)}回少ないです。`;
    }

    return `${comparison.label}と同じ回数です。`;
  })();

  return (
    <div className="animate-[visit-summary-rise_1200ms_ease-out]">
      <p className="text-xl text-[var(--black)]">
        {periodLabel}は<span className="font-bold">{visitCount}</span>
        回サ活しました
      </p>
      {comparisonText ? (
        <p className="mt-1 text-base text-[rgba(85,85,85,0.65)]">
          {comparisonText}
        </p>
      ) : null}
    </div>
  );
};

export default VisitSummaryDisplay;
