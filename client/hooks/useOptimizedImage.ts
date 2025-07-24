import { useState, useEffect, useRef } from 'react';

interface UseOptimizedImageProps {
  src: string;
  fallback?: string;
  lazy?: boolean;
  quality?: number;
}

export const useOptimizedImage = ({
  src,
  fallback = '/placeholder.svg',
  lazy = true,
  quality = 80
}: UseOptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [imageSrc, setImageSrc] = useState(lazy ? fallback : src);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Carrega a imagem 50px antes de aparecer
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Carregar imagem quando estiver na viewport
  useEffect(() => {
    if (!isInView || hasError) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
      setImageSrc(fallback);
    };

    img.src = src;
  }, [isInView, src, fallback, hasError]);

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    hasError,
    isInView
  };
};

// Hook para preload de imagens críticas
export const usePreloadImages = (images: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    // Preload crítico de imagens importantes
    const criticalImages = images.slice(0, 3); // Apenas as 3 primeiras
    
    Promise.allSettled(
      criticalImages.map(src => preloadImage(src))
    );

    // Preload restante das imagens em idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const remainingImages = images.slice(3);
        Promise.allSettled(
          remainingImages.map(src => preloadImage(src))
        );
      });
    }
  }, [images]);

  return loadedImages;
};
