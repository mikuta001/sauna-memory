import type { RecordDateDisplayProps } from "./type";

const RecordDateDisplay = ({ visitedAt }: RecordDateDisplayProps) => {
  const formatDateWithDay = (date: Date) => {
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];

    return `${year}年${month}月${day}日（${dayOfWeek}）`;
  };

  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--black)]" />
      <h2 className="shrink-0 text-base text-[var(--black)]">
        {formatDateWithDay(visitedAt)}
      </h2>
      <div className="h-px flex-1 bg-[var(--black)]" />
    </div>
  );
};

export default RecordDateDisplay;
