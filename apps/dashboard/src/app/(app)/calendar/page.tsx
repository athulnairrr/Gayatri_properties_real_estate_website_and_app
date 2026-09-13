import Link from "next/link";
import { getVisits } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { CallButton, WhatsAppButton } from "@/components/QuickActions";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

type Range = "day" | "week" | "month";

function rangeBounds(range: Range) {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  if (range === "day") to.setDate(to.getDate() + 1);
  else if (range === "week") to.setDate(to.getDate() + 7);
  else to.setMonth(to.getMonth() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-accent-100 text-accent-700",
  COMPLETED: "bg-ink-200 text-ink-600",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const range = (searchParams.range as Range) || "week";
  const { from, to } = rangeBounds(range);
  const supabase = getServerSupabase();
  const visits = await getVisits(supabase, { from, to });

  const grouped = new Map<string, typeof visits>();
  for (const v of visits) {
    const day = new Date(v.scheduled_at).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    grouped.set(day, [...(grouped.get(day) ?? []), v]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Visit Calendar</h1>
          <p className="text-sm text-ink-500">Scheduled property visits.</p>
        </div>
        <div className="flex gap-2">
          {(["day", "week", "month"] as Range[]).map((r) => (
            <Link
              key={r}
              href={`/calendar?range=${r}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize ${
                range === r ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:bg-ink-100"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">No visits scheduled in this range.</div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([day, dayVisits]) => (
            <div key={day}>
              <h2 className="mb-2 text-sm font-semibold text-ink-500">{day}</h2>
              <div className="space-y-2">
                {dayVisits.map((v: any) => (
                  <div key={v.id} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {formatDateTime(v.scheduled_at)} — {v.customer?.full_name}
                      </p>
                      <p className="text-sm text-ink-500">
                        {v.property?.property_code} — {v.property?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${STATUS_STYLES[v.status] ?? ""}`}>{v.status}</span>
                      {v.customer?.phone && <CallButton phone={v.customer.phone} />}
                      {v.customer?.phone && <WhatsAppButton phone={v.customer.phone} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
