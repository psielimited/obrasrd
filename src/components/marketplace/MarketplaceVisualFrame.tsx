import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getCategoryTheme } from "@/lib/category-theme";

interface MarketplaceVisualFrameProps {
  categorySlug?: string;
  categoryLabel?: string;
  badgeRow?: ReactNode;
  children: ReactNode;
  className?: string;
}

const MarketplaceVisualFrame = ({
  categorySlug,
  categoryLabel,
  badgeRow,
  children,
  className,
}: MarketplaceVisualFrameProps) => {
  const theme = getCategoryTheme(categorySlug);

  return (
    <div className={cn("rounded-2xl border p-2.5", theme.frameClassName, className)}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">ObrasRD</span>
          <span className={cn("text-[10px] font-semibold", theme.accentClassName)}>
            {categoryLabel || theme.label}
          </span>
        </div>
        {badgeRow}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">{children}</div>
    </div>
  );
};

export default MarketplaceVisualFrame;
