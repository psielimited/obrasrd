import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/leads-api";
import { LEAD_STATUS_LABELS } from "@/components/dashboard/dashboard-constants";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-foreground/8 text-foreground border-border font-semibold",
  contacted: "bg-muted text-muted-foreground border-border",
  qualified: "bg-muted text-foreground border-foreground/20 font-semibold",
  closed_won: "bg-foreground text-background border-foreground font-semibold",
  closed_lost: "bg-muted text-muted-foreground border-border line-through",
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
