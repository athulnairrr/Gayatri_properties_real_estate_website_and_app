import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyMedia, getPublicPropertyByCode } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { formatPriceINR, propertyTypeLabel, transactionLabel } from "@/lib/format";
import { PropertyContactActions } from "@/components/PropertyContactActions";
import { QrCodeCard } from "@/components/QrCodeCard";
import { env } from "@/lib/env";

interface PageProps {
  params: { code: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = getServerSupabase();
  const property = await getPublicPropertyByCode(supabase, params.code);
  if (!property) return { title: "Property Not Found" };
  return {
    title: `${property.title} — ${property.locality}, ${property.city}`,
    description: property.description ?? undefined,
  };
}

export const revalidate = 60;

export default async function PropertyDetailPage({ params }: PageProps) {
  const supabase = getServerSupabase();
  const property = await getPublicPropertyByCode(supabase, params.code);
  if (!property) notFound();

  const media = await getPropertyMedia(supabase, property.id);
  const publicUrl = `${env.siteUrl.replace(/\/$/, "")}/property/${property.property_code}`;
  const mapQuery = `${property.latitude},${property.longitude}`;

  const specs: Array<[string, string | number | null]> = [
    ["Bedrooms", property.bedrooms],
    ["Bathrooms", property.bathrooms],
    ["Parking", property.parking],
    ["Area", property.area_sqft ? `${property.area_sqft} sqft` : null],
  ];

  return (
    <div className="container-page py-10">
      <nav className="mb-4 text-sm text-brand-500">
        <a href="/properties" className="hover:underline">
          Properties
        </a>{" "}
        / <span className="text-brand-700">{property.property_code}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-100 to-sand-100">
            {media.length === 0 ? (
              <div className="flex aspect-video items-center justify-center text-brand-400">
                Photos coming soon
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {media.slice(0, 6).map((m) => (
                  <div key={m.id} className="aspect-square bg-brand-200/60" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
              {transactionLabel(property.transaction_type)}
            </span>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-950">{property.title}</h1>
            <p className="mt-1 text-brand-500">
              {property.locality}, {property.city}, {property.state}
            </p>
            <p className="mt-4 text-2xl font-semibold text-brand-900">{formatPriceINR(property.price)}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-brand-100 py-6 sm:grid-cols-4">
              {specs
                .filter(([, v]) => v != null)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wide text-brand-400">{label}</dt>
                    <dd className="mt-1 text-lg font-semibold text-brand-900">{value}</dd>
                  </div>
                ))}
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-400">Type</dt>
                <dd className="mt-1 text-lg font-semibold text-brand-900">
                  {propertyTypeLabel(property.property_type)}
                </dd>
              </div>
            </dl>

            {property.description && (
              <div className="mt-6">
                <h2 className="font-serif text-lg font-semibold text-brand-950">About this property</h2>
                <p className="mt-2 whitespace-pre-line text-brand-700">{property.description}</p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-serif text-lg font-semibold text-brand-950">Location</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-brand-100">
                {env.googleMapsApiKey ? (
                  <iframe
                    title="Property location"
                    className="h-72 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${env.googleMapsApiKey}&q=${mapQuery}`}
                  />
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-40 items-center justify-center bg-brand-50 text-sm font-medium text-brand-700 hover:bg-brand-100"
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
            <p className="text-sm text-brand-500">Property Code</p>
            <p className="font-mono text-lg font-semibold text-brand-900">{property.property_code}</p>
            <div className="mt-4">
              <PropertyContactActions propertyId={property.id} propertyLabel={property.title} />
            </div>
          </div>

          <QrCodeCard url={publicUrl} />
        </aside>
      </div>
    </div>
  );
}
