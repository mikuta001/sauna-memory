"use client";

import { useId } from "react";
import type { SeasonSelectProps } from "./type";

const SEASON_OPTIONS = [
  { value: null, label: "All seasons" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
] as const;

const SeasonSelect = ({ value, onChange }: SeasonSelectProps) => {
  const groupName = useId();

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Season</legend>
      <div className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] border-b border-gray-300">
        {SEASON_OPTIONS.map((season) => (
          <label
            key={season.value ?? "all"}
            className="relative min-w-0 cursor-pointer"
          >
            <input
              type="radio"
              name={groupName}
              value={season.value ?? "all"}
              checked={value === season.value}
              onChange={() => onChange(season.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center whitespace-nowrap border-b-2 border-transparent px-1 text-xs text-gray-600 transition-colors hover:text-[color:var(--black)] peer-checked:border-[color:var(--black)] peer-checked:font-semibold peer-checked:text-[color:var(--black)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--black)] sm:px-3 sm:text-sm">
              {season.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default SeasonSelect;
