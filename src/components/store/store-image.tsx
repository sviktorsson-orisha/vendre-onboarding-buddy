import { useState } from "react";

import { resolveImageUrl } from "@/lib/vendre/api";
import { cn } from "@/lib/utils";
import type { VendreImage } from "@/types/vendre";

/** Renders a store image and falls back to a branded placeholder (demo mode has no images). */
export function StoreImage({
  image,
  alt,
  className,
  label,
}: {
  image?: VendreImage | null;
  alt: string;
  className?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : resolveImageUrl(image?.image ?? image?.path);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-secondary to-muted",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <span className="brand-wordmark text-2xl text-muted-foreground/70">
          {(label ?? alt).slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
