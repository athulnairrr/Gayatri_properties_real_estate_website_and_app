"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { PublicProperty } from "@realestate/core";
import { getPublicPropertiesByCodes } from "@realestate/core";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { getWishlist, onWishlistChange, removeFromWishlist, clearWishlist } from "@/lib/wishlist";
import { formatPriceINR, transactionLabel } from "@/lib/format";
import { submitWishlistLeadAction, type SubmitWishlistState } from "@/app/actions/wishlist";

const initialState: SubmitWishlistState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Send My Wishlist to the Team"}
    </button>
  );
}

export function WishlistClient() {
  const [properties, setProperties] = useState<PublicProperty[] | null>(null);
  const [state, formAction] = useFormState(submitWishlistLeadAction, initialState);

  async function load() {
    const codes = getWishlist();
    if (codes.length === 0) {
      setProperties([]);
      return;
    }
    const supabase = getBrowserSupabase();
    const props = await getPublicPropertiesByCodes(supabase, codes);
    setProperties(props);
  }

  useEffect(() => {
    load();
    return onWishlistChange(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      clearWishlist();
    }
  }, [state.status]);

  if (properties === null) {
    return <p className="text-sm text-brand-500">Loading your wishlist…</p>;
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
          ✓
        </div>
        <h2 className="font-serif text-xl font-semibold text-brand-950">Sent!</h2>
        <p className="mt-2 text-sm text-brand-600">{state.message}</p>
        <Link href="/properties" className="btn-secondary mt-6 inline-flex">
          Keep Browsing
        </Link>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-12 text-center text-brand-500">
        <p>Your wishlist is empty.</p>
        <p className="mt-1 text-sm">
          Tap the ♡ on any property to save it here, then share your list with our team in one go.
        </p>
        <Link href="/properties" className="btn-primary mt-6 inline-flex">
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {properties.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-card"
          >
            <Link href={`/property/${p.property_code}`} className="min-w-0">
              <p className="truncate font-medium text-brand-950">{p.title}</p>
              <p className="text-sm text-brand-500">
                {p.locality}, {p.city} · {transactionLabel(p.transaction_type)}
              </p>
              <p className="mt-1 font-semibold text-brand-900">{formatPriceINR(p.price)}</p>
            </Link>
            <button
              type="button"
              onClick={() => removeFromWishlist(p.property_code)}
              className="shrink-0 text-sm text-brand-400 underline hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <aside className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-serif text-lg font-semibold text-brand-950">Talk to us about these</h2>
        <p className="mt-1 text-sm text-brand-500">
          Leave your name and phone once — our team will reach out about every property above.
        </p>
        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="propertyIds" value={properties.map((p) => p.id).join(",")} />
          <input name="fullName" required minLength={2} placeholder="Your full name" className="input-field" />
          <input
            name="phone"
            type="tel"
            required
            inputMode="tel"
            placeholder="+91 98765 43210"
            className="input-field"
          />
          {state.status === "error" && (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          )}
          <SubmitButton />
        </form>
      </aside>
    </div>
  );
}
