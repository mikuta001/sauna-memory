"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from "@headlessui/react";
import { Check, ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { SaunaComboboxProps, SaunaOption } from "./type";

const SaunaCombobox = ({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
}: SaunaComboboxProps) => {
  const selectedOption = options.find((option) => option.id === value) ?? null;
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === "") {
      return options;
    }

    return options.filter((option) =>
      option.name.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  const handleChange = (nextOption: SaunaOption | null) => {
    onChange(nextOption?.id ?? null);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;

    setQuery(nextQuery);

    if (value !== null) {
      onChange(null);
    }
  };

  return (
    <Field>
      <div className="w-full">
        <Label
          className={
            hideLabel
              ? "sr-only"
              : "mb-1 block text-sm font-medium text-[var(--black)]"
          }
        >
          {label}
        </Label>
        <Combobox
          value={selectedOption}
          by="id"
          onChange={handleChange}
          onClose={() => setQuery("")}
        >
          <div className="relative">
            <ComboboxInput
              displayValue={(option: SaunaOption | null) => option?.name ?? ""}
              onChange={handleInputChange}
              placeholder="サウナ施設を選択"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 pr-20 text-sm text-[var(--black)] outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500"
            />
            {selectedOption !== null && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="選択を解除"
                className="absolute right-9 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}

            <ComboboxButton
              aria-label="候補を開く"
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            >
              <ChevronDown size={16} aria-hidden="true" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            anchor="bottom"
            className="z-10 mt-1 max-h-56 w-[var(--input-width)] overflow-auto rounded-md border border-neutral-200 bg-white py-1 shadow-sm"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <ComboboxOption
                  key={option.id}
                  value={option}
                  className="group flex cursor-default items-center gap-2 px-3 py-2 text-sm text-[var(--black)] select-none data-focus:bg-neutral-100 data-selected:font-semibold"
                >
                  <Check
                    size={16}
                    aria-hidden="true"
                    className="invisible text-neutral-900 group-data-selected:visible"
                  />
                  <span>{option.name}</span>
                </ComboboxOption>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-neutral-500" role="status">
                候補がありません
              </p>
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    </Field>
  );
};

export default SaunaCombobox;
