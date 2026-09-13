import Link from "next/link";
import { getInternalProperties, type PropertyStatus } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { formatPriceINR } from "@/lib/format";

export const metadata = { title: "Properties" };
export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  AVAILABLE: "bg-accent-100 text-accent-700",
  HOLD: "bg-amber-100 text-amber-700",
  SOLD: "bg-ink-200 text-ink-600",
  RENTED: "bg-blue-100 text-blue-700",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const supabase = getServerSupabase();
  const properties = await getInternalProperties(supabase, {
    search: searchParams.q,
    status: (searchParams.status as PropertyStatus) || undefined,
    pageSize: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Properties</h1>
          <p className="text-sm text-ink-500">{properties.total} properties on file.</p>
        </div>
        <Link href="/properties/new" className="btn-primary">
          + Add Property
        </Link>
      </div>

      <form className="flex max-w-lg gap-2">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by title, code or locality…"
          className="input-field"
        />
      </form>

      {properties.items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">No properties found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.items.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`} className="card p-4 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-ink-400">{p.property_code}</span>
                <span className={`badge ${STATUS_STYLES[p.status]}`}>{p.status}</span>
              </div>
              <h3 className="mt-2 font-medium text-ink-900">{p.title}</h3>
              <p className="text-sm text-ink-500">{p.locality}, {p.city}</p>
              <p className="mt-2 text-lg font-semibold text-ink-900">{formatPriceINR(p.price)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
