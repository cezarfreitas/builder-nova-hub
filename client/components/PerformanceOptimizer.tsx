import { useEffect, useCallback, useRef } from "react";

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Lazy load images when they come into viewport
  const setupImageLazyLoading = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      },
    );

    // Observe all images with data-src
    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => observerRef.current?.observe(img));
  }, []);

  // Optimize DOM size by removing unused elements
  const optimizeDOM = useCallback(() => {
    // Remove empty text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          return node.textContent?.trim() === ""
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      },
    );

    const emptyNodes: Node[] = [];
    let node;
    while ((node = walker.nextNode())) {
      emptyNodes.push(node);
    }

    emptyNodes.forEach((node) => {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }, []);

  // Debounce layout changes to prevent forced reflows
  const debounceLayoutChanges = useCallback(() => {
    let layoutTimer: ReturnType<typeof setTimeout>;

    const debouncedResize = () => {
      clearTimeout(layoutTimer);
      layoutTimer = setTimeout(() => {
        // Batch DOM reads and writes
        window.requestAnimationFrame(() => {
          const elements = document.querySelectorAll("[data-auto-resize]");
          const measurements: Array<{ element: Element; height: number }> = [];

          // Batch all reads first
          elements.forEach((el) => {
            measurements.push({
              element: el,
              height: el.scrollHeight,
            });
          });

          // Then batch all writes
          measurements.forEach(({ element, height }) => {
            (element as HTMLElement).style.height = `${height}px`;
          });
        });
      }, 16); // ~60fps
    };

    window.addEventListener("resize", debouncedResize, { passive: true });

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(layoutTimer);
    };
  }, []);

  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    // Preload critical fonts
    const criticalFonts = [
      "/fonts/inter-var.woff2",
      "/fonts/inter-regular.woff2",
    ];

    criticalFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = font;
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = ["/favicon.svg", "/placeholder.svg"];

    criticalImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = src;
      link.as = "image";
      document.head.appendChild(link);
    });
  }, []);

  // Optimize third-party scripts
  const optimizeThirdPartyScripts = useCallback(() => {
    // Defer non-critical third-party scripts
    const scripts = document.querySelectorAll(
      'script[src*="analytics"], script[src*="gtag"], script[src*="facebook"]',
    );

    scripts.forEach((script) => {
      if (!script.hasAttribute("defer") && !script.hasAttribute("async")) {
        script.setAttribute("defer", "");
      }
    });

    // Add resource hints for third-party domains
    const thirdPartyDomains = [
      "www.googletagmanager.com",
      "www.google-analytics.com",
      "connect.facebook.net",
    ];

    thirdPartyDomains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = `https://${domain}`;
      document.head.appendChild(link);
    });
  }, []);

  // Setup performance monitoring
  const setupPerformanceMonitoring = useCallback(() => {
    // Monitor long tasks
    if ("PerformanceObserver" in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`, entry);

            // Track long tasks for optimization
            if (window.gtag) {
              window.gtag("event", "long_task", {
                custom_parameter_duration: Math.round(entry.duration),
                custom_parameter_start_time: Math.round(entry.startTime),
              });
            }
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        console.warn("Long task monitoring not supported");
      }

      // Monitor layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        if (clsValue > 0.1) {
          console.warn(`Layout shift detected: ${clsValue}`);
        }
      });

      try {
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch (e) {
        console.warn("Layout shift monitoring not supported");
      }

      return () => {
        longTaskObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    // Initialize all optimizations
    const cleanupFunctions: Array<() => void> = [];

    // Setup optimizations with slight delays to prevent blocking
    setTimeout(() => {
      setupImageLazyLoading();
      preloadCriticalResources();
    }, 100);

    setTimeout(() => {
      optimizeDOM();
      optimizeThirdPartyScripts();
    }, 200);

    setTimeout(() => {
      const cleanup = debounceLayoutChanges();
      if (cleanup) cleanupFunctions.push(cleanup);
    }, 300);

    setTimeout(() => {
      const cleanup = setupPerformanceMonitoring();
      if (cleanup) cleanupFunctions.push(cleanup);
    }, 500);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    setupImageLazyLoading,
    optimizeDOM,
    debounceLayoutChanges,
    preloadCriticalResources,
    optimizeThirdPartyScripts,
    setupPerformanceMonitoring,
  ]);

  return <>{children}</>;
}

// Hook for manual performance optimizations
export function usePerformanceOptimization() {
  const batchDOMUpdates = useCallback((updates: (() => void)[]) => {
    window.requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  }, []);

  const deferNonCriticalWork = useCallback((work: () => void, delay = 0) => {
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(work, { timeout: 5000 });
    } else {
      setTimeout(work, delay);
    }
  }, []);

  const preloadRoute = useCallback((routePath: string) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = routePath;
    document.head.appendChild(link);
  }, []);

  return {
    batchDOMUpdates,
    deferNonCriticalWork,
    preloadRoute,
  };
}
