"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  accentColor: "orange" | "emerald";
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  accentColor,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const accentVar =
    accentColor === "orange" ? "var(--brand-orange)" : "var(--brand-emerald)";
  const accentDarkVar =
    accentColor === "orange"
      ? "var(--brand-orange-dark)"
      : "var(--brand-emerald-dark)";

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        style={
          selected.length > 0
            ? {
                backgroundColor: accentVar,
                color: "#ffffff",
                border: `1px solid ${accentVar}`,
              }
            : {
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }
        }
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-white/30 text-xs rounded-full px-1.5 py-0.5 font-bold">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 top-full mt-2 left-0 w-64 rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-popup)",
          }}
        >
          {/* Search within dropdown */}
          <div
            className="p-2"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <input
              autoFocus
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-surface-2)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                // @ts-expect-error CSS custom property
                "--tw-ring-color": accentVar,
              }}
            />
          </div>

          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li
                className="px-4 py-3 text-sm text-center"
                style={{ color: "var(--color-text-3)" }}
              >
                No results
              </li>
            )}
            {filtered.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <li key={option}>
                  <button
                    onClick={() => onChange(option)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors"
                    style={{
                      color: isSelected
                        ? "var(--color-text)"
                        : "var(--color-text-2)",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "var(--color-surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    {option}
                    {isSelected && (
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: accentDarkVar }}
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
