"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  accentColor: "orange" | "emerald";
}

export default function FilterDropdown({ label, options, selected, onChange, accentColor }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  const activeClass = accentColor === "orange"
    ? "bg-orange-500 text-white border-orange-500"
    : "bg-emerald-600 text-white border-emerald-600";

  const hoverClass = accentColor === "orange"
    ? "hover:bg-orange-50"
    : "hover:bg-emerald-50";

  const checkClass = accentColor === "orange" ? "text-orange-500" : "text-emerald-600";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-colors ${
          selected.length > 0
            ? activeClass
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-white/30 text-xs rounded-full px-1.5 py-0.5 font-bold">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
            )}
            {filtered.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <li key={option}>
                  <button
                    onClick={() => onChange(option)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between ${hoverClass} ${isSelected ? "font-semibold text-gray-900" : "text-gray-700"}`}
                  >
                    {option}
                    {isSelected && (
                      <svg className={`w-4 h-4 ${checkClass}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
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
