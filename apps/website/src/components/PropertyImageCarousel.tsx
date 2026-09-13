"use client";

import { useEffect, useState } from "react";

// Only advances while the visitor is actually hovering the card — browsing a grid of
// cards shows each one's cover photo at rest, and hovering previews the rest of the set.
const ROTATE_MS = 2800;

export function PropertyImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!hovering || images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [hovering, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-brand-400">No photo yet</div>
    );
  }

  return (
    <div
      className="h-full w-full overflow-hidden"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setIndex(0); // rest on the cover photo again once the visitor moves on
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ width: `${images.length * 100}%`, transform: `translateX(-${index * (100 / images.length)}%)` }}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={src}
            alt={alt}
            loading="lazy"
            className="h-full object-cover"
            style={{ width: `${100 / images.length}%` }}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
