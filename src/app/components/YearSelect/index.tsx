import type { YearSelectProps } from "./type";

const YearSelect = ({
  firstRecordedYear,
  value,
  onChange: setSelectedYear,
  ...yearSelectProps
}: YearSelectProps) => {
  // firstRecordedYear を基準に選択肢を生成
  const nowYear = new Date().getFullYear();
  const yearCount = nowYear - firstRecordedYear + 1;
  const optionalYears = Array.from(
    { length: yearCount },
    (_, index) => firstRecordedYear + index,
  );

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue =
      event.target.value === "all" ? "all" : Number(event.target.value);

    setSelectedYear(nextValue);
  };

  return (
    <div>
      <select value={value} onChange={handleYearChange} {...yearSelectProps}>
        {optionalYears.map((year) => {
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
        <option key="all" value="all">
          all
        </option>
      </select>
    </div>
  );
};

export default YearSelect;
