import type { TrustBadgeType } from "@/lib/provider-trust";
import TrustBadge from "@/components/marketplace/TrustBadge";

interface TrustBadgeRowProps {
  badges: TrustBadgeType[];
}

const TrustBadgeRow = ({ badges }: TrustBadgeRowProps) => {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <TrustBadge key={badge} type={badge} />
      ))}
    </div>
  );
};

export default TrustBadgeRow;
