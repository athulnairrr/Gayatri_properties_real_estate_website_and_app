import { notFound } from "next/navigation";
import { getCustomerById, getInternalProperties, type LeadStatus } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { CallButton, WhatsAppButton } from "@/components/QuickActions";
import { formatDate } from "@/lib/format";
import {
  addNoteAction,
  createFollowUpAction,
  scheduleVisitAction,
  setLeadStatusAction,
} from "@/app/actions/crm";

export const dynamic = "force-dynamic";

const STATUSES: LeadStatus[] = ["NEW_LEAD", "CONTACTED", "ACTIVE", "INACTIVE"];

export default async function LeadDetailPage({ params }: { params: { customerId: string } }) {
  const supabase = getServerSupabase();
  const customer = await getCustomerById(supabase, params.customerId);
  if (!customer) notFound();

  const availableProperties = await getInternalProperties(supabase, {
    status: "AVAILABLE",
    page: 1,
    pageSize: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{customer.full_name}</h1>
          <p className="text-sm text-ink-500">
            {customer.customer_code} · {customer.phone}
            {!customer.phone_verified && " · phone unverified"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LeadStatusBadge status={customer.lead_status} />
          <CallButton phone={customer.phone} />
          <WhatsAppButton phone={customer.whatsapp ?? customer.phone} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Lead Status</h2>
            <form action={setLeadStatusAction} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="customerId" value={customer.id} />
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="submit"
                  name="status"
                  value={s}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    customer.lead_status === s
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 text-ink-600 hover:bg-ink-100"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </form>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Notes</h2>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-ink-50 p-3 text-sm text-ink-700">
              {customer.notes || "No notes yet."}
            </pre>
            <form action={addNoteAction} className="mt-4 flex gap-2">
              <input type="hidden" name="customerId" value={customer.id} />
              <input
                name="note"
                required
                placeholder="Add a note about this customer…"
                className="input-field"
              />
              <button type="submit" className="btn-primary shrink-0">
                Add Note
              </button>
            </form>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Schedule a Visit</h2>
            <form action={scheduleVisitAction} className="mt-3 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="customerId" value={customer.id} />
              <select name="propertyId" required className="input-field sm:col-span-2">
                <option value="">Select property…</option>
                {availableProperties.items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.property_code} — {p.title}
                  </option>
                ))}
              </select>
              <input type="datetime-local" name="scheduledAt" required className="input-field" />
              <input name="notes" placeholder="Notes (optional)" className="input-field" />
              <button type="submit" className="btn-primary sm:col-span-2">
                Schedule Visit
              </button>
            </form>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Create Follow-Up</h2>
            <form action={createFollowUpAction} className="mt-3 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="customerId" value={customer.id} />
              <input type="datetime-local" name="nextFollowUp" required className="input-field" />
              <input name="notes" placeholder="What to follow up about" className="input-field" />
              <button type="submit" className="btn-primary sm:col-span-2">
                Create Follow-Up
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Contact Details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">Phone</dt>
                <dd className="text-ink-800">{customer.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">WhatsApp</dt>
                <dd className="text-ink-800">{customer.whatsapp ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Email</dt>
                <dd className="text-ink-800">{customer.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Added</dt>
                <dd className="text-ink-800">{formatDate(customer.created_at)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
