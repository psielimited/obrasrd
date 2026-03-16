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
    className: "border-emerald-700 bg-emerald-950 text-emerald-100",
    icon: ShieldCheck,
  },
  active: {
    label: "Proveedor activo",
    className: "border-cyan-700 bg-cyan-950 text-cyan-100",
    icon: CheckCheck,
  },
  registered_project: {
    label: "Proyecto registrado",
    className: "border-violet-700 bg-violet-950 text-violet-100",
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
