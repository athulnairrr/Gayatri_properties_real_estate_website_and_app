"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [transactionType, setTransactionType] = useState("SALE");
  const [propertyType, setPropertyType] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("q", location.trim());
    params.set("transactionType", transactionType);
    if (propertyType) params.set("propertyType", propertyType);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full gap-3 rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:p-3"
    >
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location — e.g. Vasant Vihar, Thane West"
        className="input-field"
        aria-label="Location"
      />
      <select
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
        className="input-field"
        aria-label="Buy or Rent"
      >
        <option value="SALE">Buy</option>
        <option value="RENT">Rent</option>
      </select>
      <select
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        className="input-field"
        aria-label="Property type"
      >
        <option value="">Any type</option>
        <option value="FLAT">Apartment</option>
        <option value="VILLA">Villa</option>
        <option value="PLOT">Plot</option>
        <option value="COMMERCIAL">Commercial</option>
      </select>
      <button type="submit" className="btn-primary">
        Search Properties
      </button>
    </form>
  );
}
