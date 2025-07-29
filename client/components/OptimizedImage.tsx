import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  fetchpriority = 'auto',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (loading === 'eager' || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Começar a carregar 50px antes de entrar na tela
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [loading]);

  // Gerar URLs otimizadas
  const getOptimizedSrc = (originalSrc: string, w?: number, h?: number) => {
    // Se for uma imagem local (uploads), retornar como está
    if (originalSrc.startsWith('/uploads') || originalSrc.startsWith('./')) {
      return originalSrc;
    }

    // Para URLs externas, tentar adicionar parâmetros de otimização
    try {
      const url = new URL(originalSrc);
      
      // Otimizações para diferentes CDNs
      if (url.hostname.includes('vteximg.com.br')) {
        // VTEX CDN
        if (w) url.searchParams.set('w', w.toString());
        if (h) url.searchParams.set('h', h.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('format', 'webp');
      } else if (url.hostname.includes('unsplash.com')) {
        // Unsplash
        if (w) url.searchParams.set('w', w.toString());
        if (h) url.searchParams.set('h', h.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('fm', 'webp');
      }
      
      return url.toString();
    } catch {
      return originalSrc;
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder dimensions para evitar layout shift
  const placeholderStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    aspectRatio: width && height ? `${width}/${height}` : undefined,
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={placeholderStyle}
      ref={imgRef}
    >
      {/* Placeholder enquanto carrega */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={placeholderStyle}
        >
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}

      {/* Placeholder de erro */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={placeholderStyle}
        >
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
      )}

      {/* Imagem principal */}
      {(isInView || loading === 'eager') && !hasError && (
        <img
          src={getOptimizedSrc(src, width, height)}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchpriority={fetchpriority}
          decoding="async"
          sizes={sizes}
          className={`
            absolute inset-0 w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};
