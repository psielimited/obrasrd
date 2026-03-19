import { MapPin } from "lucide-react";
import { Material } from "@/data/marketplace";

interface MaterialCardProps {
  material: Material;
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  const whatsappUrl = `https://wa.me/${material.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar: ${material.name}. Vi el producto en ObrasRD.`,
  )}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card obra-shadow transition-shadow hover:shadow-md">
      {/* Topbar: category + delivery */}
      <div
        className={`flex items-center justify-between border-b border-border px-3.5 py-2 ${material.bulkPrice ? "bg-orange-50" : "bg-muted"}`}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {material.category}
        </span>
        {material.delivery && (
          <span className="inline-flex items-center gap-1.5 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-green-700">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
            Delivery
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 pb-0 pt-3">
        {/* Name + supplier */}
        <h3 className="text-[15px] font-extrabold leading-tight tracking-tight text-foreground">
          {material.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {material.supplier}
        </p>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {material.location}
        </div>

        {/* Rule */}
        <div className="my-3 h-px bg-border" />

        {/* Price block */}
        <div className="flex items-end justify-between">
          {/* Unit price */}
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] font-semibold text-muted-foreground">RD$</span>
            <span className="font-tabular text-[26px] font-black leading-none tracking-tight text-foreground">
              {material.price.toLocaleString()}
            </span>
            <span className="mb-0.5 text-[11px] text-muted-foreground">
              / {material.unit}
            </span>
          </div>

          {/* Bulk pricing */}
          {material.bulkPrice && (
            <div className="flex flex-col items-end text-right">
              <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Volumen
              </span>
              <span className="text-[13px] font-bold leading-tight text-accent">
                RD${material.bulkPrice.toLocaleString()} / {material.unit}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {material.bulkUnit}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {material.description}
        </p>
      </div>

      {/* Footer: CTAs */}
      <div className="mt-3 flex items-center gap-2 border-t border-border px-3.5 py-3">
        <button
          onClick={() => window.open(whatsappUrl, "_blank")}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-background transition-colors hover:bg-foreground/90 active:scale-[0.98]"
        >
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
          WhatsApp
        </button>
        <button
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:scale-[0.98]"
          aria-label="Guardar material"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7 12C7 12 1.5 8.5 1.5 4.5C1.5 2.84 2.84 1.5 4.5 1.5C5.5 1.5 6.39 2.01 7 2.78C7.61 2.01 8.5 1.5 9.5 1.5C11.16 1.5 12.5 2.84 12.5 4.5C12.5 8.5 7 12 7 12Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MaterialCard;
