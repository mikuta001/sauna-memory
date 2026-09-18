"use client";

import { useId } from "react";
import type { InputProps } from "./type";

const Input = ({
  label,
  id,
  className,
  errorMessage,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorMessageId = `${generatedId}-error`;
  const hasError = Boolean(errorMessage);
  const describedBy = [ariaDescribedBy, hasError ? errorMessageId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="w-full max-w-sm">
      <label
        htmlFor={inputId}
        className="mb-1 block text-sm font-medium text-[var(--black)]"
      >
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={hasError ? true : ariaInvalid}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-md border bg-white px-3 py-2 text-sm text-[var(--black)] outline-none transition-colors placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100",
          hasError
            ? "border-red-600 focus:border-red-600"
            : "border-neutral-300 focus:border-neutral-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {hasError && (
        <p id={errorMessageId} className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Input;
