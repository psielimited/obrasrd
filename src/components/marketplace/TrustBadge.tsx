import { Badge } from "@/components/ui/badge";
import type { TrustBadgeType } from "@/lib/provider-trust";
import { CheckCheck, ShieldCheck, ShieldEllipsis } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUST_BADGE_CONFIG: Record<
  TrustBadgeType,
  { label: string; className: string; icon: typeof ShieldCheck }
> = {
  verified: {
    label: "Servicio verificado",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    icon: ShieldCheck,
  },
  active: {
    label: "Proveedor activo",
    className: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
    icon: CheckCheck,
  },
  registered_project: {
    label: "Proyecto registrado",
    className: "border-violet-500/40 bg-violet-500/10 text-violet-200",
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
    <Badge variant="outline" className={cn("font-medium gap-1.5", config.className, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

export default TrustBadge;
