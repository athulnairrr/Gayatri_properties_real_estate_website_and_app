"use client";

import Link from "next/link";
import { useState } from "react";
import { WishlistNavLink } from "./WishlistNavLink";

const NAV_LINKS = [
  { href: "/properties?transactionType=SALE", label: "Buy" },
  { href: "/properties?transactionType=RENT", label: "Rent" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Prefetch is disabled for every /properties variant: Next.js's client Router Cache keys
// prefetched entries loosely enough that visiting one filtered link after hovering/prefetching
// another can serve stale, wrongly-filtered results. Search correctness matters more here
// than the small prefetch speed gain.

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-brand-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-800 text-sm text-white">
            GP
          </span>
          Gayatri Properties
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              prefetch={false}
              className="text-sm font-medium text-brand-700 transition hover:text-brand-950"
            >
              {link.label}
            </Link>
          ))}
          <WishlistNavLink />
        </nav>

        <div className="hidden md:block">
          <Link href="/contact" className="btn-primary">
            Talk to Us
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 md:hidden"
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
        <nav className="border-t border-brand-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
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
            <WishlistNavLink mobile />
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              Talk to Us
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
