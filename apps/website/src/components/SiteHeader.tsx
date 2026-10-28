"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { HeaderSearch, SearchForm } from "./HeaderSearch";
import { WishlistNavLink } from "./WishlistNavLink";

const NAV_LINKS = [
  { href: "/", label: "All Properties" },
  { href: "/properties", label: "Advanced Search" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Prefetch is disabled for every /properties variant: Next.js's client Router Cache keys
// prefetched entries loosely enough that visiting one filtered link after hovering/prefetching
// another can serve stale, wrongly-filtered results. Search correctness matters more here
// than the small prefetch speed gain.

// Deliberately slim: the header is mostly a search bar so the property list starts
// right below it. Everything else lives in the menu.
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3">
        <Link
          href="/"
          prefetch={false}
          aria-label="Gayatri Properties — home"
          className="flex shrink-0 items-center gap-2 font-serif text-lg font-semibold text-brand-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-sm text-white">
            GP
          </span>
          <span className="hidden lg:inline">Gayatri Properties</span>
        </Link>

        <div className="min-w-0 flex-1 lg:mx-auto lg:max-w-xl">
          <Suspense fallback={<SearchForm />}>
            <HeaderSearch />
          </Suspense>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <WishlistNavLink />
          <Link href="/contact" className="btn-primary px-5 py-2.5">
            Talk to Us
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-200"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-brand-900" />
            <span className="block h-0.5 w-5 bg-brand-900" />
            <span className="block h-0.5 w-5 bg-brand-900" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-brand-100 bg-white">
          <div className="container-page flex flex-col gap-1 py-3 lg:items-end">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-brand-800 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="lg:hidden" onClick={() => setOpen(false)}>
              <WishlistNavLink mobile />
            </div>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full lg:hidden"
            >
              Talk to Us
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
