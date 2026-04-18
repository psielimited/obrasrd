import type { TrustBadgeType } from "@/lib/provider-trust";
import TrustBadge from "@/components/marketplace/TrustBadge";
import { cn } from "@/lib/utils";

interface TrustBadgeRowProps {
  badges: TrustBadgeType[];
  className?: string;
  badgeClassName?: string;
}

const TrustBadgeRow = ({ badges, className, badgeClassName }: TrustBadgeRowProps) => {
  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge) => (
        <TrustBadge key={badge} type={badge} className={badgeClassName} />
      ))}
    </div>
  );
};

export default TrustBadgeRow;
