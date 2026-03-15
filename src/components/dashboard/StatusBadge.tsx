import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/leads-api";
import { LEAD_STATUS_LABELS } from "@/components/dashboard/dashboard-constants";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  qualified: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  closed_won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  closed_lost: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge variant="outline" className={cn("border", STATUS_STYLES[status], className)}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
};

export { StatusBadge };
