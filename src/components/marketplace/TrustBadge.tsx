import { Badge } from "@/components/ui/badge";
import type { TrustBadgeType } from "@/lib/provider-trust";
import { CheckCheck, ShieldCheck, ShieldEllipsis } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUST_BADGE_CONFIG: Record<
  TrustBadgeType,
  { label: string; className: string; icon: typeof ShieldCheck }
> = {
  verified: {
    label: "Verificado",
    className: "border-border bg-muted text-foreground",
    icon: ShieldCheck,
  },
  active: {
    label: "Activo",
    className: "border-border bg-muted text-foreground",
    icon: CheckCheck,
  },
  registered_project: {
    label: "Proyecto registrado",
    className: "border-border bg-muted text-foreground",
    icon: ShieldEllipsis,
  },
};

interface TrustBadgeProps {
  type: TrustBadgeType;
  className?: string;
}

const TrustBadge = ({ type, className }: TrustBadgeProps) => {
  const config = TRUST_BADGE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("text-xs font-semibold gap-1.5 px-2.5 py-1", config.className, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

export default TrustBadge;
