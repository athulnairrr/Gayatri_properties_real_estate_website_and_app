import Link from "next/link";
import { getAllImagesByPropertyId, searchProperties } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabaseServer";
import { PropertyListItem } from "@/components/PropertyListItem";

// The home page IS the listing: no hero, no filter form — visitors land straight on the
// properties. The only controls are the header search (?q=) and the BHK chips (?bhk=).
export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

const BHK_CHIPS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "1 BHK", value: "1" },
  { label: "2 BHK", value: "2" },
  { label: "3+ BHK", value: "3" },
];

interface PageProps {
  searchParams: { q?: string; bhk?: string; page?: string };
}

function homeHref(params: { q?: string; bhk?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.bhk) sp.set("bhk", params.bhk);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function HomePage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() || undefined;
  const bhk = BHK_CHIPS.some((c) => c.value && c.value === searchParams.bhk) ? searchParams.bhk : undefined;
  const page = Math.max(Number(searchParams.page) || 1, 1);

  const supabase = getServerSupabase();
  const result = await searchProperties(supabase, {
    locality: q,
    // 1 and 2 are exact; the last chip ("3+") catches 3 bedrooms and up
    bedroomsExact: bhk && bhk !== "3" ? Number(bhk) : undefined,
    bedrooms: bhk === "3" ? 3 : undefined,
    sort: "newest",
    page,
    pageSize: PAGE_SIZE,
  });
  const images = await getAllImagesByPropertyId(supabase, result.items.map((p) => p.id));
  const totalPages = Math.max(Math.ceil(result.total / PAGE_SIZE), 1);

  return (
    <div className="container-page py-4 sm:py-6">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {BHK_CHIPS.map((chip) => {
          const active = (bhk ?? "") === chip.value;
          return (
            <Link
              key={chip.label}
              href={homeHref({ q, bhk: chip.value })}
              prefetch={false}
              aria-current={active ? "true" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-brand-800 bg-brand-800 text-white"
                  : "border-brand-200 bg-white text-brand-800 hover:bg-brand-50"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-brand-500">
        {result.total} propert{result.total === 1 ? "y" : "ies"}
        {q && (
          <>
            {" "}for &ldquo;{q}&rdquo; ·{" "}
            <Link href={homeHref({ bhk })} prefetch={false} className="font-medium text-brand-800 underline">
              Clear search
            </Link>
          </>
        )}
      </p>

      {result.items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-10 text-center text-brand-500">
          No properties match. Try another area or BHK.
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((p) => (
            <PropertyListItem key={p.id} property={p} image={images[p.id]?.[0]} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3 text-sm font-medium">
          {page > 1 ? (
            <Link href={homeHref({ q, bhk, page: page - 1 })} prefetch={false} className="btn-secondary px-5 py-2">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-brand-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={homeHref({ q, bhk, page: page + 1 })} prefetch={false} className="btn-secondary px-5 py-2">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
