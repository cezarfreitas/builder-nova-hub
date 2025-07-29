import { useEffect } from 'react';
import { useMetaTracking as useMetaTrackingContext } from '../contexts/MetaTrackingContext';

// Re-export from context for backwards compatibility
export { useMetaTracking } from '../contexts/MetaTrackingContext';

interface PageViewData {
  page_title: string;
  page_url: string;
  referrer?: string;
}

// Hook específico para scroll tracking
export const useScrollTracking = () => {
  const { trackScrollDepth } = useMetaTrackingContext();

  useEffect(() => {
    let isTracking = true;
    const tracked = new Set<number>();

    const handleScroll = () => {
      if (!isTracking) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercentage === 25 && !tracked.has(25)) {
        tracked.add(25);
        trackScrollDepth(25);
      } else if (scrollPercentage === 50 && !tracked.has(50)) {
        tracked.add(50);
        trackScrollDepth(50);
      } else if (scrollPercentage === 75 && !tracked.has(75)) {
        tracked.add(75);
        trackScrollDepth(75);
      } else if (scrollPercentage >= 100 && !tracked.has(100)) {
        tracked.add(100);
        trackScrollDepth(100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      isTracking = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [trackScrollDepth]);
};

// Hook para time tracking
export const useTimeTracking = () => {
  const { trackTimeOnPage } = useMetaTrackingContext();

  useEffect(() => {
    const startTime = Date.now();
    const tracked = new Set<number>();

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      if (timeSpent === 30 && !tracked.has(30)) {
        tracked.add(30);
        trackTimeOnPage(30);
      } else if (timeSpent === 60 && !tracked.has(60)) {
        tracked.add(60);
        trackTimeOnPage(60);
      } else if (timeSpent === 120 && !tracked.has(120)) {
        tracked.add(120);
        trackTimeOnPage(120);
      } else if (timeSpent === 300 && !tracked.has(300)) {
        tracked.add(300);
        trackTimeOnPage(300);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trackTimeOnPage]);
};
