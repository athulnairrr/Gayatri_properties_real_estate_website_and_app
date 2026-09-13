"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import type { StaffProfile } from "@realestate/core";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/properties", label: "Properties", icon: "🏢" },
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/leads", label: "Leads", icon: "📥" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/follow-ups", label: "Follow-Ups", icon: "⏰" },
];

export function DashboardNav({ staff }: { staff: StaffProfile }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-semibold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs text-white">
            TR
          </span>
          Thane Realty
        </div>
        <button
          type="button"
          className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
      {open && (
        <div className="border-b border-ink-100 bg-white lg:hidden">
          {links}
          <div className="border-t border-ink-100 p-3">
            <StaffFooter staff={staff} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
        <div className="flex items-center gap-2 px-5 py-5 font-semibold text-ink-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm text-white">
            TR
          </span>
          Thane Realty
        </div>
        {links}
        <div className="border-t border-ink-100 p-4">
          <StaffFooter staff={staff} />
        </div>
      </aside>
    </>
  );
}

function StaffFooter({ staff }: { staff: StaffProfile }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-900">{staff.full_name}</p>
        <p className="text-xs text-ink-400">{staff.role === "ADMIN" ? "Administrator" : "Staff"}</p>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="text-xs font-medium text-ink-500 underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
