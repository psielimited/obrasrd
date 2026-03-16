import MarketplaceVisualFrame from "@/components/marketplace/MarketplaceVisualFrame";
import { ImageOff } from "lucide-react";
import type { TrustBadgeType } from "@/lib/provider-trust";
import TrustBadge from "@/components/marketplace/TrustBadge";

interface PortfolioGalleryProps {
  images: string[];
  categorySlug?: string;
  categoryName?: string;
  trustBadges?: TrustBadgeType[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

const PortfolioGallery = ({
  images,
  categorySlug,
  categoryName,
  trustBadges = [],
  emptyTitle = "Sin trabajos visuales todavia",
  emptyDescription = "Este proveedor aun no ha publicado imagenes de obra.",
  className,
}: PortfolioGalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <ImageOff className="h-6 w-6 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-200">{emptyTitle}</p>
        <p className="text-xs text-slate-400 mt-1">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((imageUrl, index) => (
          <MarketplaceVisualFrame
            key={`${imageUrl}-${index}`}
            categorySlug={categorySlug}
            categoryLabel={categoryName}
            badgeRow={
              trustBadges.length > 0 ? (
                <div className="hidden sm:flex items-center gap-1">
                  {trustBadges.slice(0, 1).map((badge) => (
                    <TrustBadge key={badge} type={badge} className="text-[10px] px-2 py-0.5" />
                  ))}
                </div>
              ) : null
            }
          >
            <img
              src={imageUrl}
              alt={`Trabajo realizado ${index + 1}`}
              className="h-52 w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </MarketplaceVisualFrame>
        ))}
      </div>
    </div>
  );
};

export default PortfolioGallery;
