import { useEffect, useRef } from 'react';
import { useMetaTracking } from './useMetaTracking';

interface SectionTrackingOptions {
  threshold?: number;
  rootMargin?: string;
  trackOnce?: boolean;
}

export const useSectionTracking = (
  sectionName: string,
  options: SectionTrackingOptions = {}
) => {
  const ref = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);
  const { trackSectionView } = useMetaTracking();

  const {
    threshold = 0.5,
    rootMargin = '0px',
    trackOnce = true
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!trackOnce || !trackedRef.current) {
              trackSectionView(sectionName);
              if (trackOnce) {
                trackedRef.current = true;
              }
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [sectionName, threshold, rootMargin, trackOnce, trackSectionView]);

  return ref;
};

// Hook específico para componentes múltiplos (como cards)
export const useMultiSectionTracking = (
  sectionName: string,
  itemId: string | number,
  options: SectionTrackingOptions = {}
) => {
  const ref = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);
  const { trackSectionView } = useMetaTracking();

  const {
    threshold = 0.7,
    rootMargin = '0px',
    trackOnce = true
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!trackOnce || !trackedRef.current) {
              trackSectionView(`${sectionName}_${itemId}`);
              if (trackOnce) {
                trackedRef.current = true;
              }
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [sectionName, itemId, threshold, rootMargin, trackOnce, trackSectionView]);

  return ref;
};
