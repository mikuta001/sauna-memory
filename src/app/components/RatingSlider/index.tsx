"use client";

import { useId, type CSSProperties } from "react";
import { MAX_RATING } from "@/app/constants/rating";
import styles from "./RatingSlider.module.css";
import type { RatingSliderProps } from "./type";

const MIN_RATING = 0;
const RATING_STEP = 0.5;
const DEFAULT_SLIDER_VALUE = MIN_RATING;

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
  const percentage = ((sliderValue - MIN_RATING) / (MAX_RATING - MIN_RATING)) * 100;
  // 幅28pxのグリップの中心に色の境目を合わせる。両端は0%・100%にする。
  const fillPosition = percentage === 0 || percentage === 100
    ? `${percentage}%`
    : `calc(${percentage}% + ${14 - (percentage / 100) * 28}px)`;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={sliderId} className="text-sm font-normal text-neutral-500">
          {label}
        </label>
        <output
          htmlFor={sliderId}
          className={`min-w-16 rounded-md px-3 py-1 text-center tabular-nums ${
            value === null ? "text-sm font-normal text-neutral-500" : "text-xl font-medium text-yellow-600"
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
          style={{ "--fill-position": fillPosition } as CSSProperties}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorMessageId : undefined}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          // 初期位置の0を選んだ場合も「未評価」から0点に切り替える。
          onPointerUp={(event) => onChange(Number(event.currentTarget.value))}
          onKeyUp={(event) => {
            if (event.key === "Home") onChange(MIN_RATING);
          }}
          className={`${styles.input} h-12 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-yellow-600/35`}
        />
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
