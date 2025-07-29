import { Suspense, lazy, ComponentType, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LazyBundleProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadTime?: number;
}

// Generic loading component
const DefaultLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      <span className="text-sm text-gray-500">Carregando...</span>
    </div>
  </div>
);

export function LazyBundle({ 
  children, 
  fallback = <DefaultLoader />,
  minLoadTime = 0 
}: LazyBundleProps) {
  const [isReady, setIsReady] = useState(minLoadTime === 0);

  useEffect(() => {
    if (minLoadTime > 0) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, minLoadTime);

      return () => clearTimeout(timer);
    }
  }, [minLoadTime]);

  if (!isReady) {
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Factory function for creating lazy components with better error boundaries
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  name?: string
) {
  const LazyComponent = lazy(async () => {
    try {
      // Add artificial delay in development to test loading states
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const module = await importFn();
      return module;
    } catch (error) {
      console.error(`Failed to load lazy component ${name || 'Unknown'}:`, error);
      
      // Return a fallback component on error
      return {
        default: (() => (
          <div className="flex items-center justify-center min-h-[200px] p-4">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-sm text-gray-600">
                Erro ao carregar componente
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Recarregar página
              </button>
            </div>
          </div>
        )) as T
      };
    }
  });

  LazyComponent.displayName = `Lazy(${name || 'Anonymous'})`;
  return LazyComponent;
}

// Hook for preloading components
export function useComponentPreloader() {
  const preloadComponent = (importFn: () => Promise<any>) => {
    // Start loading the component when user hovers or focuses
    importFn().catch(console.error);
  };

  const preloadOnInteraction = (
    importFn: () => Promise<any>,
    element: HTMLElement | null
  ) => {
    if (!element) return;

    const handleInteraction = () => {
      preloadComponent(importFn);
      // Remove listeners after first interaction
      element.removeEventListener('mouseenter', handleInteraction);
      element.removeEventListener('focus', handleInteraction);
    };

    element.addEventListener('mouseenter', handleInteraction, { passive: true });
    element.addEventListener('focus', handleInteraction, { passive: true });

    return () => {
      element.removeEventListener('mouseenter', handleInteraction);
      element.removeEventListener('focus', handleInteraction);
    };
  };

  return {
    preloadComponent,
    preloadOnInteraction
  };
}

// Progressive enhancement for critical routes
export function withProgressiveEnhancement<P extends object>(
  Component: ComponentType<P>,
  fallbackComponent?: ComponentType<P>
) {
  return function ProgressiveComponent(props: P) {
    const [isEnhanced, setIsEnhanced] = useState(false);

    useEffect(() => {
      // Check if we have enough resources to render the enhanced version
      const checkResources = () => {
        const connection = (navigator as any).connection;
        const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
        const isLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
        
        if (!isSlowConnection && !isLowMemory) {
          setIsEnhanced(true);
        }
      };

      // Small delay to avoid blocking initial render
      setTimeout(checkResources, 100);
    }, []);

    if (!isEnhanced && fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} />;
    }

    return <Component {...props} />;
  };
}

// Bundle splitting utilities
export const bundleUtils = {
  // Split vendor chunks more aggressively
  getVendorChunkName: (id: string) => {
    if (id.includes('node_modules')) {
      if (id.includes('react') || id.includes('react-dom')) return 'react';
      if (id.includes('lucide')) return 'icons';
      if (id.includes('chart')) return 'charts';
      if (id.includes('@radix-ui')) return 'ui';
      return 'vendor';
    }
    return 'main';
  },

  // Preload critical chunks
  preloadCriticalChunks: () => {
    const criticalChunks = [
      '/assets/react-*.js',
      '/assets/router-*.js',
      '/assets/ui-*.js'
    ];

    criticalChunks.forEach(pattern => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      // In a real implementation, you'd resolve the actual chunk names
      document.head.appendChild(link);
    });
  }
};
