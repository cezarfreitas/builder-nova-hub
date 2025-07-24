import { lazy, Suspense, useEffect, useState } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  threshold?: number;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazySection = ({ 
  children, 
  threshold = 0.1, 
  fallback = <div className="skeleton h-32 w-full rounded" />,
  className = ""
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return (
    <div ref={setRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Hook para lazy loading de componentes pesados
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  dependencies: any[] = []
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadComponent = async () => {
      setLoading(true);
      try {
        const { default: LoadedComponent } = await importFunc();
        if (mounted) {
          setComponent(() => LoadedComponent);
        }
      } catch (error) {
        console.error('Error loading component:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { Component, loading };
};
