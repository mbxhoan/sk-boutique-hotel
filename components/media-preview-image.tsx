"use client";

import type { ImgHTMLAttributes } from "react";

type MediaPreviewImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "className" | "loading" | "src"> & {
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "eager" | "lazy";
  src?: string | null;
};

export function MediaPreviewImage({
  alt,
  className,
  fallbackSrc = "/home/block.jpg",
  loading = "lazy",
  src,
  ...props
}: MediaPreviewImageProps) {
  const resolvedSrc = src && src.trim().length > 0 ? src : fallbackSrc;

  return (
    <img
      {...props}
      alt={alt}
      className={className}
      loading={loading}
      src={resolvedSrc}
      onError={(event) => {
        if (event.currentTarget.src !== fallbackSrc) {
          event.currentTarget.src = fallbackSrc;
        }
      }}
    />
  );
}
