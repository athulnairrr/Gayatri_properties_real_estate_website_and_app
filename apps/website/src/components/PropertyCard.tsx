import Link from "next/link";
import type { PublicProperty, PropertyRadiusResult } from "@realestate/core";
import { formatPriceINR, propertyTypeLabel, transactionLabel } from "@/lib/format";

type CardProperty = PublicProperty | PropertyRadiusResult;

function specsLine(p: CardProperty): string {
  const parts: string[] = [];
  if (p.bedrooms != null) parts.push(`${p.bedrooms} Bed`);
  if (p.bathrooms != null) parts.push(`${p.bathrooms} Bath`);
  if (p.area_sqft != null) parts.push(`${p.area_sqft} sqft`);
  return parts.join(" · ");
}

export function PropertyCard({
  property,
  imageUrl,
}: {
  property: CardProperty;
  imageUrl?: string;
}) {
  const distance = "distance_km" in property ? property.distance_km : undefined;

  return (
    <Link
      href={`/property/${property.property_code}`}
      className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-100 to-sand-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-400">No photo yet</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-800">
          {transactionLabel(property.transaction_type)}
        </span>
        {distance != null && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-900/80 px-3 py-1 text-xs font-medium text-white">
            {distance} km away
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-semibold leading-snug text-brand-950 group-hover:text-brand-700">
            {property.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-brand-500">
          {property.locality}, {property.city}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-brand-900">{formatPriceINR(property.price)}</span>
          <span className="text-xs font-medium uppercase tracking-wide text-brand-400">
            {propertyTypeLabel(property.property_type)}
          </span>
        </div>
        {specsLine(property) && (
          <p className="mt-2 text-xs text-brand-500">{specsLine(property)}</p>
        )}
      </div>
    </Link>
  );
}
