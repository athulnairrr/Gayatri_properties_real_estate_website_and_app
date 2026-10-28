"use client";

import { useSearchParams } from "next/navigation";

// A plain GET form to the home page — a full navigation, so it can never be served a
// stale Router Cache entry (see the prefetch note in SiteHeader). Searching starts a
// fresh search, so any BHK chip is dropped on purpose.
export function HeaderSearch() {
  const searchParams = useSearchParams();
  return <SearchForm defaultValue={searchParams.get("q") ?? ""} />;
}

export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/" method="get" role="search" className="relative w-full">
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search area, e.g. Vasant Vihar"
        aria-label="Search properties by area"
        className="w-full rounded-full border border-brand-200 bg-brand-50 py-2.5 pl-10 pr-4 text-base text-brand-950 placeholder:text-brand-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm"
      />
    </form>
  );
}
