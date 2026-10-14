import { ChevronDown } from "lucide-react";
import type { YearSelectProps } from "./type";

const YearSelect = ({
  firstRecordedYear,
  value,
  onChange: setSelectedYear,
  className = "",
  ...yearSelectProps
}: YearSelectProps) => {
  // firstRecordedYear を基準に選択肢を生成
  const nowYear = new Date().getFullYear();
  const yearCount = nowYear - firstRecordedYear + 1;
  const optionalYears = Array.from(
    { length: yearCount },
    (_, index) => nowYear - index,
  );

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue =
      event.target.value === "all" ? "all" : Number(event.target.value);

    setSelectedYear(nextValue);
  };

  return (
    <div className="relative inline-flex">
      <select
        aria-label="Year"
        value={value}
        onChange={handleYearChange}
        {...yearSelectProps}
        className={`min-h-11 cursor-pointer appearance-none border-0 border-b border-transparent bg-transparent py-2 pl-2 pr-8 text-right text-xl font-semibold text-[color:var(--black)] focus-visible:border-[color:var(--black)] focus-visible:outline-none ${className}`}
      >
        {optionalYears.map((year) => {
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
        <option key="all" value="all">
          All years
        </option>
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--black)]"
      />
    </div>
  );
};

export default YearSelect;
