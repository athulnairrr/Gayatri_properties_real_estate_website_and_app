import type { LeadStatus } from "@realestate/core";

const STYLES: Record<LeadStatus, string> = {
  NEW_LEAD: "bg-accent-100 text-accent-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-amber-100 text-amber-700",
  INACTIVE: "bg-ink-100 text-ink-500",
};

const LABELS: Record<LeadStatus, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`badge ${STYLES[status]}`}>{LABELS[status]}</span>;
}
