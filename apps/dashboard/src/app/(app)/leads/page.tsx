import Link from "next/link";
import { getInternalLeads, type LeadStatus } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { CallButton, WhatsAppButton } from "@/components/QuickActions";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ label: string; value: LeadStatus | "" }> = [
  { label: "All", value: "" },
  { label: "New", value: "NEW_LEAD" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = getServerSupabase();
  const status = (searchParams.status as LeadStatus | undefined) || undefined;
  const leads = await getInternalLeads(supabase, { status, page: 1, pageSize: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Leads</h1>
        <p className="text-sm text-ink-500">Every website enquiry, newest first.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/leads?status=${f.value}` : "/leads"}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              (searchParams.status ?? "") === f.value
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 text-ink-600 hover:bg-ink-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {leads.items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">No leads match this filter.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Interested Property</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.items.map((lead) => (
                <tr key={lead.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">{lead.customer.full_name}</td>
                  <td className="px-4 py-3 text-ink-600">{lead.customer.phone}</td>
                  <td className="px-4 py-3 text-ink-600">{lead.source}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {lead.property ? `${lead.property.property_code} — ${lead.property.title}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.customer.lead_status} />
                  </td>
                  <td className="px-4 py-3 text-ink-500">{formatDateTime(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <CallButton phone={lead.customer.phone} />
                      <WhatsAppButton phone={lead.customer.whatsapp ?? lead.customer.phone} />
                      <Link href={`/leads/${lead.customer.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
