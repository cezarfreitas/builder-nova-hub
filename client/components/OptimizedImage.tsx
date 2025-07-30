import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  sizes?: string;
  quality?: number;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+",
  sizes,
  quality = 75,
  loading = "lazy",
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive src set
  const generateSrcSet = useCallback(
    (baseSrc: string) => {
      if (!baseSrc || baseSrc.startsWith("data:")) return "";

      const widths = [320, 640, 768, 1024, 1280, 1920];
      const extension = baseSrc.split(".").pop()?.toLowerCase();

      // For optimization, we'd typically have a service that generates different sizes
      // For now, we'll use the original image with different quality settings
      return widths
        .map((w) => {
          if (width && w > width) return null;
          return `${baseSrc}?w=${w}&q=${quality} ${w}w`;
        })
        .filter(Boolean)
        .join(", ");
    },
    [quality, width],
  );

  // Generate optimized src with quality and format
  const generateOptimizedSrc = useCallback(
    (baseSrc: string, targetWidth?: number) => {
      if (!baseSrc || baseSrc.startsWith("data:")) return baseSrc;

      const params = new URLSearchParams();
      if (targetWidth) params.set("w", targetWidth.toString());
      params.set("q", quality.toString());

      // Prefer WebP format if supported
      if (supportsWebP()) {
        params.set("f", "webp");
      }

      return `${baseSrc}?${params.toString()}`;
    },
    [quality],
  );

  // Check WebP support
  const supportsWebP = useCallback(() => {
    try {
      return (
        document
          .createElement("canvas")
          .toDataURL("image/webp")
          .indexOf("data:image/webp") === 0
      );
    } catch {
      return false;
    }
  }, []);

  // Handle image loading
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (priority || loading === "eager") {
      // Load immediately for priority images
      setCurrentSrc(generateOptimizedSrc(src, width));
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSrc(generateOptimizedSrc(src, width));
            observerRef.current?.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
        threshold: 0.1,
      },
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, width, priority, loading, generateOptimizedSrc]);

  // Preload critical images
  useEffect(() => {
    if (priority) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = generateOptimizedSrc(src, width);
      link.as = "image";
      if (sizes) link.setAttribute("imagesizes", sizes);
      document.head.appendChild(link);
    }
  }, [src, width, priority, sizes, generateOptimizedSrc]);

  const srcSet = generateSrcSet(src);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-all duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "opacity-50",
          "w-full h-full object-cover",
        )}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
        {...props}
      />

      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400"
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Hook for image optimization utilities
export function useImageOptimization() {
  const convertToWebP = useCallback((file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert to WebP"));
            }
          },
          "image/webp",
          0.8,
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const resizeImage = useCallback(
    (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          const { width, height } = img;

          // Calculate new dimensions
          let newWidth = width;
          let newHeight = height;

          if (width > maxWidth) {
            newWidth = maxWidth;
            newHeight = (height * maxWidth) / width;
          }

          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = (newWidth * maxHeight) / newHeight;
          }

          canvas.width = newWidth;
          canvas.height = newHeight;

          ctx?.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to resize image"));
              }
            },
            "image/jpeg",
            0.8,
          );
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    },
    [],
  );

  return {
    convertToWebP,
    resizeImage,
  };
}
