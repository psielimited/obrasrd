import { cn } from "@/lib/utils";

interface HumanPhotoProps {
  src: string;
  alt: string;
  /**
   * CSS aspect-ratio value (e.g. "16/9", "1/1", "4/5"). Reserves space to prevent CLS.
   */
  aspect?: string;
  /**
   * If true, eager-load with fetchpriority high. Reserve for hero/LCP images only.
   */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /**
   * Target rendered width hint for `sizes` attribute (px). Defaults to 800.
   */
  sizesHint?: string;
  width?: number;
  height?: number;
}

/**
 * <HumanPhoto> — single source of truth for human/construction photography.
 *
 * - Wraps <img> in an aspect-ratio container to prevent layout shift.
 * - Defaults to lazy loading + async decoding (use priority for hero only).
 * - Applies a B&W safety filter so even off-brand photos stay on-brand.
 */
const HumanPhoto = ({
  src,
  alt,
  aspect = "16/9",
  priority = false,
  className,
  imgClassName,
  sizesHint = "(min-width: 768px) 50vw, 100vw",
  width,
  height,
}: HumanPhotoProps) => {
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-muted", className)}
      style={{ aspectRatio: aspect }}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizesHint}
        width={width}
        height={height}
        className={cn(
          "absolute inset-0 h-full w-full object-cover grayscale contrast-[1.05]",
          imgClassName,
        )}
      />
    </div>
  );
};

export default HumanPhoto;
