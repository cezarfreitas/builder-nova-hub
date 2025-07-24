import React from 'react';
import { useOptimizedImage } from '../hooks/useOptimizedImage';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  lazy?: boolean;
  quality?: number;
  aspectRatio?: string; // ex: "16:9", "1:1"
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  fallback,
  lazy = true,
  quality,
  aspectRatio,
  className = '',
  style,
  ...props
}) => {
  const { ref, src: optimizedSrc, isLoaded, hasError } = useOptimizedImage({
    src,
    fallback,
    lazy,
    quality
  });

  const aspectRatioStyle = aspectRatio ? {
    aspectRatio: aspectRatio.replace(':', '/'),
    objectFit: 'cover' as const
  } : {};

  return (
    <img
      ref={ref}
      src={optimizedSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      style={{
        ...aspectRatioStyle,
        ...style
      }}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      {...props}
    />
  );
};
