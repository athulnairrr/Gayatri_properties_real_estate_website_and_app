import Link from "next/link";
import { getInternalCustomers } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { CallButton, WhatsAppButton } from "@/components/QuickActions";

export const metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = getServerSupabase();
  const customers = await getInternalCustomers(supabase, { search: searchParams.q, pageSize: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Customers</h1>
        <p className="text-sm text-ink-500">Every buyer, tenant, owner and broker on file.</p>
      </div>

      <form className="max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by name, phone or code…"
          className="input-field"
        />
      </form>

      {customers.items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">No customers found.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.items.map((c) => (
                <tr key={c.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">{c.customer_code}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{c.full_name}</td>
                  <td className="px-4 py-3 text-ink-600">{c.phone}</td>
                  <td className="px-4 py-3 text-ink-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={c.lead_status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <CallButton phone={c.phone} />
                      <WhatsAppButton phone={c.whatsapp ?? c.phone} />
                      <Link href={`/leads/${c.id}`} className="btn-secondary px-3 py-1.5 text-xs">
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
