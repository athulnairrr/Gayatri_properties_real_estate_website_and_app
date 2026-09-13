import { notFound } from "next/navigation";
import { getInternalPropertyById, publicPropertyUrl } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { PropertyForm } from "@/components/PropertyForm";
import { QrCodeCard } from "@/components/QrCodeCard";
import { updatePropertyAction, archivePropertyAction } from "@/app/actions/properties";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const property = await getInternalPropertyById(supabase, params.id);
  if (!property) notFound();

  const publicUrl = publicPropertyUrl(env.siteUrl, property.property_code);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{property.title}</h1>
          <p className="font-mono text-sm text-ink-500">{property.property_code}</p>
        </div>
        <form action={archivePropertyAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={property.id} />
          {(["AVAILABLE", "HOLD", "SOLD", "RENTED"] as const).map((s) => (
            <button
              key={s}
              type="submit"
              name="status"
              value={s}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                property.status === s
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 text-ink-600 hover:bg-ink-100"
              }`}
            >
              {s}
            </button>
          ))}
        </form>
      </div>

      <QrCodeCard url={publicUrl} />

      <PropertyForm property={property} action={updatePropertyAction} submitLabel="Save Changes" />
    </div>
  );
}
