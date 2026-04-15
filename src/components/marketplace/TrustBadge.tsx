import { Badge } from "@/components/ui/badge";
import type { TrustBadgeType } from "@/lib/provider-trust";
import { BadgeCheck, BriefcaseBusiness, CheckCheck, FolderCheck, IdCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUST_BADGE_CONFIG: Record<
  TrustBadgeType,
  { label: string; className: string; icon: typeof ShieldCheck }
> = {
  provider_verified: {
    label: "Proveedor verificado",
    className: "border-border bg-muted text-foreground",
    icon: ShieldCheck,
  },
  identity_confirmed: {
    label: "Identidad confirmada",
    className: "border-border bg-muted text-foreground",
    icon: IdCard,
  },
  portfolio_validated: {
    label: "Portafolio validado",
    className: "border-border bg-muted text-foreground",
    icon: FolderCheck,
  },
  project_registered: {
    label: "Proyecto registrado",
    className: "border-border bg-muted text-foreground",
    icon: BriefcaseBusiness,
  },
  rapid_response: {
    label: "Respuesta rapida",
    className: "border-border bg-muted text-foreground",
    icon: BadgeCheck,
  },
  active_this_month: {
    label: "Activo este mes",
    className: "border-border bg-muted text-foreground",
    icon: CheckCheck,
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
