"use client";

import { useEffect, useRef, useState } from "react";

// Decorative artwork: the adjacent heading supplies the film title. Keep a
// local fallback when a catalog image fails, without promoting it to a title.
export function HomeArtwork({ src, fallback, className, credit, priority = false }: {
  src: string | null;
  fallback: string;
  className: string;
  credit?: string | null;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const source = src && src !== failedSource ? src : fallback;
  useEffect(() => {
    // A cached 404 can finish before React attaches onError during hydration.
    // Inspect the already-completed image as well as future error events.
    const image = imageRef.current;
    if (src && source === src && image?.complete && image.naturalWidth === 0) {
      setFailedSource(src);
    }
  }, [src, source]);
  return (
    // Native images preserve support for existing external credits/URLs without
    // broadening the Next image optimizer allowlist. Only the hero is eager.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imageRef} src={source} alt="" className={className} title={src && source === src ? credit ?? undefined : undefined}
      loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"}
      onError={() => { if (src && source === src) setFailedSource(src); }} />
  );
}
