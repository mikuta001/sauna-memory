"use client";

import { useId } from "react";
import { MAX_RATING } from "@/app/constants/rating";
import styles from "./RatingSlider.module.css";
import type { RatingSliderProps } from "./type";

const MIN_RATING = 0;
const RATING_STEP = 0.5;
const DEFAULT_SLIDER_VALUE = MIN_RATING;
const RATING_VALUES = Array.from(
  { length: (MAX_RATING - MIN_RATING) / RATING_STEP + 1 },
  (_, index) => MIN_RATING + index * RATING_STEP,
);
const INTEGER_RATINGS = Array.from(
  { length: MAX_RATING - MIN_RATING + 1 },
  (_, index) => MIN_RATING + index,
);

const RatingSlider = ({
  value,
  onChange,
  label = "評価",
  errorMessage,
}: RatingSliderProps) => {
  const sliderId = useId();
  const errorMessageId = `${sliderId}-error`;
  const sliderValue = value ?? DEFAULT_SLIDER_VALUE;
  const hasError = Boolean(errorMessage);
  const displayValue = value === null ? "未評価" : value.toFixed(1);

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={sliderId} className="text-sm font-medium">
          {label}
        </label>
        <output
          htmlFor={sliderId}
          className={`min-w-16 rounded-md px-3 py-1 text-center text-lg font-semibold ${
            value === null ? "text-neutral-500" : "text-yellow-700"
          }`}
        >
          {displayValue}
        </output>
      </div>

      <div className="flex min-h-12 items-center">
        <input
          id={sliderId}
          type="range"
          min={MIN_RATING}
          max={MAX_RATING}
          step={RATING_STEP}
          value={sliderValue}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorMessageId : undefined}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          className={`${styles.input} h-12 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-yellow-600/35`}
        />
      </div>

      <div className="mx-[14px] text-neutral-500" aria-hidden="true">
        <div className="flex h-2 items-start justify-between">
          {RATING_VALUES.map((rating) => (
            <span
              key={rating}
              className={
                Number.isInteger(rating)
                  ? "h-2 w-px bg-current"
                  : "h-1 w-px bg-current opacity-[0.55]"
              }
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs leading-4">
          {INTEGER_RATINGS.map((rating) => (
            <span key={rating}>{rating}</span>
          ))}
        </div>
      </div>

      {hasError && (
        <p id={errorMessageId} className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default RatingSlider;
