"use client";

import type { FormEvent } from "react";
import { FiNavigation, FiSearch } from "react-icons/fi";

type SearchBarProps = {
  city: string;
  onCityChange: (city: string) => void;
  onSearch: (city: string) => void;
  onLocate: () => void;
  busy: boolean;
};

export default function SearchBar({ city, onCityChange, onSearch, onLocate, busy }: SearchBarProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(city);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label className="relative block flex-1">
        <span className="sr-only">City</span>
        <FiSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-lg text-white/60"
        />
        <input
          type="text"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          placeholder="Search for a city"
          autoComplete="off"
          className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-4 text-base text-white backdrop-blur placeholder:text-white/50 focus:border-white/50 focus:outline-none focus:ring-4 focus:ring-white/15"
        />
      </label>
      <button type="submit" disabled={busy} className="btn btn-solid">
        Show weather
      </button>
      <button type="button" onClick={onLocate} disabled={busy} className="btn btn-glass">
        <FiNavigation aria-hidden="true" />
        Use my location
      </button>
    </form>
  );
}
