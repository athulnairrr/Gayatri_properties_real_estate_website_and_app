import Link from "next/link";
import type { PublicProperty } from "@realestate/core";
import { formatPriceINR, propertyTypeLabel, transactionLabel } from "@/lib/format";
import { WishlistButton } from "./WishlistButton";

// Compact row for the home page list: photo on the left, details on the right.
export function PropertyListItem({ property, image }: { property: PublicProperty; image?: string }) {
  const specs: string[] = [];
  if (property.bedrooms != null) specs.push(`${property.bedrooms} BHK`);
  if (property.area_sqft != null) specs.push(`${property.area_sqft} sqft`);
  specs.push(propertyTypeLabel(property.property_type));

  return (
    <Link
      href={`/property/${property.property_code}`}
      className="group flex gap-3 rounded-2xl border border-brand-100 bg-white p-2.5 shadow-card transition hover:shadow-lg sm:gap-4 sm:p-3"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 to-sand-100 sm:h-32 sm:w-32">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={property.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-brand-400">No photo</div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-semibold leading-tight text-brand-900">{formatPriceINR(property.price)}</p>
          <WishlistButton propertyCode={property.property_code} />
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-brand-950 group-hover:text-brand-700">
          {property.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-brand-500">
          {property.locality}, {property.city}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs text-brand-600">
          <span className="rounded-full bg-brand-100 px-2 py-0.5 font-medium text-brand-800">
            {transactionLabel(property.transaction_type)}
          </span>
          <span className="truncate">{specs.join(" · ")}</span>
        </div>
      </div>
    </Link>
  );
}
