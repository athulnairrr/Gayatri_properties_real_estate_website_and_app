import Link from "next/link";
import { getDashboardCounts, getInternalLeads } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { StatCard } from "@/components/StatCard";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { CallButton, WhatsAppButton } from "@/components/QuickActions";
import { formatPriceINR } from "@/lib/format";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = getServerSupabase();
  const [counts, recentLeads] = await Promise.all([
    getDashboardCounts(supabase),
    getInternalLeads(supabase, { page: 1, pageSize: 6 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Today&apos;s Overview</h1>
        <p className="text-sm text-ink-500">A snapshot of what needs your attention.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="New Leads" value={counts.newLeads} tone="accent" />
        <StatCard label="Available Properties" value={counts.availableProperties} />
        <StatCard label="Today's Visits" value={counts.todaysVisits} />
        <StatCard label="Upcoming Visits" value={counts.upcomingVisits} />
        <StatCard label="Follow-Ups Due" value={counts.followUpsDue} tone="warn" />
        <StatCard label="Active Deals" value={counts.activeDeals} />
        <StatCard label="Pending Commission" value={formatPriceINR(counts.pendingCommission)} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Recent Leads</h2>
          <Link href="/leads" className="text-sm font-medium text-ink-600 hover:underline">
            View all →
          </Link>
        </div>

        {recentLeads.items.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-500">
            No leads yet. New website enquiries will show up here automatically.
          </div>
        ) : (
          <div className="space-y-3">
            {recentLeads.items.map((lead) => (
              <div key={lead.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink-900">{lead.customer.full_name}</p>
                    <LeadStatusBadge status={lead.customer.lead_status} />
                    {!lead.customer.phone_verified && (
                      <span className="badge bg-ink-100 text-ink-500">Phone unverified</span>
                    )}
                  </div>
                  <p className="text-sm text-ink-500">{lead.customer.phone} · {lead.source}</p>
                  {lead.property && (
                    <p className="mt-1 text-sm text-ink-600">
                      Interested in: <span className="font-medium">{lead.property.property_code}</span> —{" "}
                      {lead.property.title}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CallButton phone={lead.customer.phone} />
                  <WhatsAppButton
                    phone={lead.customer.whatsapp ?? lead.customer.phone}
                    message={`Hi ${lead.customer.full_name}, this is Thane Realty regarding your enquiry.`}
                  />
                  <Link href={`/leads/${lead.customer.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
