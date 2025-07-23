import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  style,
  priority = false,
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Gerar URLs otimizadas
  const getOptimizedImageUrl = (originalUrl: string, format: 'webp' | 'jpg' = 'webp') => {
    if (!originalUrl) return '';
    
    // Se for uma imagem local (upload), retornar como está
    if (originalUrl.startsWith('/uploads/')) {
      return originalUrl;
    }
    
    // Para URLs externas, tentar otimizar
    if (originalUrl.includes('unsplash.com')) {
      // Otimizar imagens do Unsplash
      const params = new URLSearchParams();
      params.set('auto', 'format,compress');
      params.set('fm', format);
      params.set('q', '85');
      return `${originalUrl}&${params.toString()}`;
    }
    
    if (originalUrl.includes('vteximg.com.br')) {
      // Otimizar imagens da Vtex
      return originalUrl.replace(/\.(jpg|jpeg|png)/, `.${format}`);
    }
    
    return originalUrl;
  };

  const webpUrl = getOptimizedImageUrl(src, 'webp');
  const jpgUrl = getOptimizedImageUrl(src, 'jpg');

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Placeholder enquanto carrega */}
      {!isLoaded && !hasError && placeholder && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(5px) brightness(0.8)'
          }}
        />
      )}

      {/* Imagem otimizada */}
      <picture>
        {/* WebP para navegadores que suportam */}
        {webpUrl && webpUrl !== src && (
          <source srcSet={webpUrl} type="image/webp" />
        )}
        
        {/* JPEG como fallback */}
        <img
          src={jpgUrl || src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            contentVisibility: priority ? 'visible' : 'auto',
            containIntrinsicSize: priority ? 'none' : '1px 400px'
          }}
        />
      </picture>
    </div>
  );
}
