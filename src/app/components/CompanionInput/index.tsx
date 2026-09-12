"use client";

import { X } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import type { Companion, CompanionInputProps } from "./type";

const CompanionInput = ({ companions, onChange }: CompanionInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const isAddingRef = useRef(false);
  const trimmedInputValue = inputValue.trim();

  const handleAddCompanion = () => {
    if (isAddingRef.current) {
      return;
    }

    if (trimmedInputValue === "") {
      return;
    }

    isAddingRef.current = true;

    const nextCompanion: Companion = {
      id: crypto.randomUUID(),
      name: trimmedInputValue,
    };

    onChange([...companions, nextCompanion]);
    setInputValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    handleAddCompanion();
  };

  const handleRemoveCompanion = (companionId: string) => {
    onChange(companions.filter((companion) => companion.id !== companionId));
  };

  return (
    <div className="w-full max-w-sm">
      <label
        htmlFor="companion-input"
        className="mb-1 block text-sm font-medium text-[var(--black)]"
      >
        同行者
      </label>

      <div className="flex gap-2">
        <input
          id="companion-input"
          type="text"
          value={inputValue}
          onChange={(event) => {
            isAddingRef.current = false;
            setInputValue(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="同行者名を入力"
          className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[var(--black)] outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500"
        />
        <button
          type="button"
          onClick={handleAddCompanion}
          disabled={trimmedInputValue === ""}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          追加
        </button>
      </div>

      {companions.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="同行者一覧">
          {companions.map((companion) => (
            <li
              key={companion.id}
              className="flex max-w-full items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm text-[var(--black)]"
            >
              <span className="truncate">{companion.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveCompanion(companion.id)}
                aria-label={`${companion.name}を削除`}
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompanionInput;
