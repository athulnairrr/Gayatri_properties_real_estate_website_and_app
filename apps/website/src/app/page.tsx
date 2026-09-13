import Link from "next/link";
import { getAllImagesByPropertyId, getFeaturedProperties, searchProperties } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabaseServer";
import { HeroSearch } from "@/components/HeroSearch";
import { PropertyCard } from "@/components/PropertyCard";
import { ContactCta } from "@/components/ContactCta";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getServerSupabase();
  const [featured, recent] = await Promise.all([
    getFeaturedProperties(supabase, 6),
    searchProperties(supabase, { page: 1, pageSize: 6, sort: "newest" }),
  ]);
  const propertyImages = await getAllImagesByPropertyId(supabase, [
    ...featured.map((p) => p.id),
    ...recent.items.map((p) => p.id),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sand-600">
              Thane · Vasant Vihar · Manpada · Majiwada
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-brand-950 sm:text-5xl">
              Find a Property You&apos;ll Love
            </h1>
            <p className="mt-4 max-w-lg text-lg text-brand-600">
              Buy or rent with confidence. Browse verified apartments, villas, plots and
              commercial spaces across Thane and nearby areas.
            </p>
          </div>
          <div>
            <HeroSearch />
            <p className="mt-3 text-center text-sm text-brand-500 lg:text-left">
              Prefer to search by distance?{" "}
              <Link href="/properties#near-me" className="font-medium text-brand-800 underline">
                Search near a location
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-brand-950">Featured Properties</h2>
            <p className="mt-1 text-sm text-brand-500">Handpicked listings our team recommends this week.</p>
          </div>
          <Link href="/properties" className="hidden text-sm font-medium text-brand-700 hover:underline sm:block">
            View all properties →
          </Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} images={propertyImages[p.id] ?? []} />
            ))}
          </div>
        )}
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-brand-950">Recently Added</h2>
            <p className="mt-1 text-sm text-brand-500">The newest listings on Gayatri Properties.</p>
          </div>
          <Link href="/properties" className="hidden text-sm font-medium text-brand-700 hover:underline sm:block">
            View all properties →
          </Link>
        </div>
        {recent.items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.items.map((p) => (
              <PropertyCard key={p.id} property={p} images={propertyImages[p.id] ?? []} />
            ))}
          </div>
        )}
      </section>

      <ContactCta />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-12 text-center text-brand-500">
      No properties to show yet. Please check back soon.
    </div>
  );
}
