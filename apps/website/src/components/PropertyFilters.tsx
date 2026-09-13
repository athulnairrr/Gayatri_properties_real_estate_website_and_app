"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RADIUS_OPTIONS_KM, THANE_LOCALITIES } from "@/lib/localities";

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const q = searchParams.get("q") ?? "";
  const transactionType = searchParams.get("transactionType") ?? "";
  const propertyType = searchParams.get("propertyType") ?? "";
  const bedrooms = searchParams.get("bedrooms") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const radiusKm = searchParams.get("radiusKm") ?? "";

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`/properties?${params.toString()}`);
    router.refresh();
  }

  function handleLocalitySelect(label: string) {
    const loc = THANE_LOCALITIES.find((l) => l.label === label);
    if (!loc) {
      updateParams({ lat: null, lng: null, radiusKm: null, q: label });
      return;
    }
    updateParams({ lat: String(loc.lat), lng: String(loc.lng), radiusKm: radiusKm || "5", q: null });
  }

  function useMyLocation() {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Location isn't supported on this device — please search by area name instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        updateParams({
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
          radiusKm: radiusKm || "5",
          q: null,
        });
      },
      () => {
        setLocating(false);
        setGeoError("Location access was denied. You can still search by typing an area name.");
      },
      { timeout: 8000 }
    );
  }

  const hasRadiusSearch = Boolean(searchParams.get("lat") && searchParams.get("lng"));

  return (
    <div id="near-me" className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={transactionType}
          onChange={(e) => updateParams({ transactionType: e.target.value || null })}
          className="input-field"
        >
          <option value="">Buy or Rent</option>
          <option value="SALE">Buy</option>
          <option value="RENT">Rent</option>
        </select>
        <select
          value={propertyType}
          onChange={(e) => updateParams({ propertyType: e.target.value || null })}
          className="input-field"
        >
          <option value="">Any property type</option>
          <option value="FLAT">Apartment</option>
          <option value="VILLA">Villa</option>
          <option value="PLOT">Plot</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
        <select
          value={bedrooms}
          onChange={(e) => updateParams({ bedrooms: e.target.value || null })}
          className="input-field"
        >
          <option value="">Any bedrooms</option>
          <option value="1">1+ BHK</option>
          <option value="2">2+ BHK</option>
          <option value="3">3+ BHK</option>
          <option value="4">4+ BHK</option>
        </select>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="input-field"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-brand-100 pt-4">
        <span className="text-sm font-medium text-brand-700">Search near:</span>
        <select
          defaultValue=""
          onChange={(e) => e.target.value && handleLocalitySelect(e.target.value)}
          className="input-field w-auto min-w-[220px]"
        >
          <option value="">Choose an area…</option>
          {THANE_LOCALITIES.map((loc) => (
            <option key={loc.label} value={loc.label}>
              {loc.label}
            </option>
          ))}
        </select>

        {hasRadiusSearch && (
          <select
            value={radiusKm || "5"}
            onChange={(e) => updateParams({ radiusKm: e.target.value })}
            className="input-field w-auto"
          >
            {RADIUS_OPTIONS_KM.map((km) => (
              <option key={km} value={km}>
                Within {km} km
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="btn-secondary"
        >
          {locating ? "Locating…" : "Use my location"}
        </button>

        {hasRadiusSearch && (
          <button
            type="button"
            onClick={() => updateParams({ lat: null, lng: null, radiusKm: null })}
            className="text-sm text-brand-500 underline"
          >
            Clear location search
          </button>
        )}
      </div>

      {geoError && <p className="text-sm text-red-600">{geoError}</p>}
      {q && !hasRadiusSearch && (
        <p className="text-sm text-brand-500">
          Showing results for &ldquo;{q}&rdquo;.{" "}
          <button type="button" onClick={() => updateParams({ q: null })} className="underline">
            Clear
          </button>
        </p>
      )}
    </div>
  );
}
