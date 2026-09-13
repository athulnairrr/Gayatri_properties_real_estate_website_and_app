import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPropertiesWithinRadius,
  searchProperties,
  type PropertyType,
  type TransactionType,
} from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";

export const metadata: Metadata = {
  title: "Properties for Sale & Rent in Thane",
  description: "Browse apartments, villas, plots and commercial properties across Thane.",
};

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

const PAGE_SIZE = 12;

export default async function PropertiesPage({ searchParams }: PageProps) {
  const supabase = getServerSupabase();

  const transactionType = searchParams.transactionType as TransactionType | undefined;
  const propertyType = searchParams.propertyType as PropertyType | undefined;
  const bedrooms = searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined;
  const sort = (searchParams.sort as "newest" | "price_asc" | "price_desc") ?? "newest";
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const lat = searchParams.lat ? Number(searchParams.lat) : undefined;
  const lng = searchParams.lng ? Number(searchParams.lng) : undefined;
  const radiusKm = searchParams.radiusKm ? Number(searchParams.radiusKm) : undefined;
  const isRadiusSearch = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);

  let items;
  let total = 0;

  if (isRadiusSearch) {
    const results = await getPropertiesWithinRadius(supabase, {
      lat: lat as number,
      lng: lng as number,
      radiusKm: radiusKm ?? 5,
      transactionType,
      propertyType,
      bedrooms,
      limit: PAGE_SIZE,
    });
    items = results;
    total = results.length;
  } else {
    const result = await searchProperties(supabase, {
      transactionType,
      propertyType,
      bedrooms,
      locality: searchParams.q,
      sort,
      page,
      pageSize: PAGE_SIZE,
    });
    items = result.items;
    total = result.total;
  }

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-brand-950">Properties</h1>
        <p className="mt-1 text-sm text-brand-500">
          {total} propert{total === 1 ? "y" : "ies"} found
        </p>
      </div>

      <Suspense>
        <PropertyFilters />
      </Suspense>

      <div className="mt-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-12 text-center text-brand-500">
            No properties match your search. Try widening your filters or radius.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      {!isRadiusSearch && totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams(
              Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
            );
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/properties?${params.toString()}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                  p === page ? "bg-brand-800 text-white" : "text-brand-600 hover:bg-brand-50"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
