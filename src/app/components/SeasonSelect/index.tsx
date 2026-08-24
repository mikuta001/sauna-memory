"use client";

import type { SeasonSelectProps } from "./type";

const SEASON_OPTIONS = [
  {
    value: "spring",
    label: "Spring",
    className: {
      selected: "bg-green-100 text-green-700",
      unselected: "bg-green-50 text-green-900 hover:bg-green-100",
    },
  },
  {
    value: "summer",
    label: "Summer",
    className: {
      selected: "bg-orange-100 text-orange-700",
      unselected: "bg-orange-50 text-orange-900 hover:bg-orange-100",
    },
  },
  {
    value: "autumn",
    label: "Autumn",
    className: {
      selected: "bg-amber-100 text-amber-700",
      unselected: "bg-amber-50 text-amber-900 hover:bg-amber-100",
    },
  },
  {
    value: "winter",
    label: "Winter",
    className: {
      selected: "bg-sky-100 text-sky-700",
      unselected: "bg-sky-50 text-sky-900 hover:bg-sky-100",
    },
  },
] as const;

const SeasonSelect = ({ value, onChange }: SeasonSelectProps) => {
  return (
    <div className="flex gap-2" role="group" aria-label="Season select">
      {SEASON_OPTIONS.map((season) => {
        const isSelected = value === season.value;

        return (
          <button
            key={season.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => {
              onChange(isSelected ? null : season.value);
            }}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              isSelected
                ? `font-semibold ${season.className.selected}`
                : season.className.unselected
            }`}
          >
            {season.label}
          </button>
        );
      })}
    </div>
  );
};

export default SeasonSelect;
