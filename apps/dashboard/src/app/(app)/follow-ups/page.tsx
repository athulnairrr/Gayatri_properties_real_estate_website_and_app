import Link from "next/link";
import { getFollowUps } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { CallButton, WhatsAppButton } from "@/components/QuickActions";
import { formatDateTime } from "@/lib/format";
import { updateFollowUpStatusAction } from "@/app/actions/crm";

export const metadata = { title: "Follow-Ups" };
export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const supabase = getServerSupabase();
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const all = await getFollowUps(supabase, { status: "PENDING" });

  const overdue = all.filter((f: any) => new Date(f.next_follow_up) < now);
  const dueToday = all.filter(
    (f: any) => new Date(f.next_follow_up) >= now && new Date(f.next_follow_up) <= todayEnd
  );
  const upcoming = all.filter((f: any) => new Date(f.next_follow_up) > todayEnd);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Follow-Ups</h1>
        <p className="text-sm text-ink-500">Stay on top of every customer conversation.</p>
      </div>

      <FollowUpSection title="Overdue" items={overdue} tone="warn" />
      <FollowUpSection title="Due Today" items={dueToday} tone="accent" />
      <FollowUpSection title="Upcoming" items={upcoming} tone="default" />
    </div>
  );
}

function FollowUpSection({ title, items, tone }: { title: string; items: any[]; tone: string }) {
  return (
    <section>
      <h2 className={`mb-3 text-sm font-semibold ${tone === "warn" ? "text-warn-600" : "text-ink-700"}`}>
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <div className="card p-6 text-center text-sm text-ink-400">Nothing here.</div>
      ) : (
        <div className="space-y-2">
          {items.map((f) => (
            <div key={f.id} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink-900">{f.customer?.full_name}</p>
                <p className="text-sm text-ink-500">{formatDateTime(f.next_follow_up)}</p>
                {f.notes && <p className="mt-1 text-sm text-ink-600">{f.notes}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {f.customer?.phone && <CallButton phone={f.customer.phone} />}
                {f.customer?.phone && <WhatsAppButton phone={f.customer.phone} />}
                <form action={updateFollowUpStatusAction}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="status" value="DONE" />
                  <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                    Complete
                  </button>
                </form>
                <Link href={`/leads/${f.customer_id}`} className="btn-secondary px-3 py-1.5 text-xs">
                  Reschedule
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
