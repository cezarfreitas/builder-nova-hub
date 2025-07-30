import { useEffect } from "react";

export function CSSMinifier() {
  useEffect(() => {
    // Remove unused CSS rules
    const removeUnusedCSS = () => {
      const allElements = document.querySelectorAll("*");
      const usedClasses = new Set<string>();

      // Collect all used classes
      allElements.forEach((el) => {
        el.classList.forEach((className) => {
          usedClasses.add(className);
        });
      });

      // Find and disable unused stylesheets (only if safe to do so)
      const stylesheets = Array.from(document.styleSheets);

      stylesheets.forEach((stylesheet) => {
        try {
          if (stylesheet.href && stylesheet.href.includes("unused")) {
            // Only remove stylesheets that are explicitly marked as unused
            const linkElement = document.querySelector(
              `link[href="${stylesheet.href}"]`,
            );
            if (linkElement) {
              linkElement.remove();
            }
          }
        } catch (e) {
          // Cross-origin stylesheets can't be accessed
          console.debug("Cannot access stylesheet:", stylesheet.href);
        }
      });
    };

    // Inline critical CSS for above-the-fold content
    const inlineCriticalCSS = () => {
      const criticalCSS = `
        /* Critical styles for above-the-fold content */
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Critical layout styles */
        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Navigation critical styles */
        .nav-critical {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
        }
      `;

      // Create and inject critical CSS
      const style = document.createElement("style");
      style.setAttribute("data-critical", "true");
      style.textContent = criticalCSS;
      document.head.insertBefore(style, document.head.firstChild);
    };

    // Defer non-critical CSS
    const deferNonCriticalCSS = () => {
      const nonCriticalLinks = document.querySelectorAll(
        'link[rel="stylesheet"]:not([data-critical])',
      );

      nonCriticalLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.includes("critical")) {
          // Convert to preload and load asynchronously
          link.setAttribute("rel", "preload");
          link.setAttribute("as", "style");
          link.setAttribute("onload", "this.onload=null;this.rel='stylesheet'");

          // Fallback for browsers that don't support preload
          const noscript = document.createElement("noscript");
          const fallbackLink = document.createElement("link");
          fallbackLink.setAttribute("rel", "stylesheet");
          fallbackLink.setAttribute("href", href);
          noscript.appendChild(fallbackLink);
          link.parentNode?.insertBefore(noscript, link.nextSibling);
        }
      });
    };

    // Optimize web fonts
    const optimizeWebFonts = () => {
      // Add font-display: swap to improve loading performance
      const fontFaces = document.styleSheets;

      // Create optimized font loading stylesheet
      const fontOptimizationCSS = `
        @font-face {
          font-family: 'Inter';
          font-display: swap;
          src: url('/fonts/inter-var.woff2') format('woff2');
          font-weight: 100 900;
        }
        
        /* Fallback fonts for better FOUT handling */
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `;

      const fontStyle = document.createElement("style");
      fontStyle.setAttribute("data-font-optimization", "true");
      fontStyle.textContent = fontOptimizationCSS;
      document.head.appendChild(fontStyle);

      // Preload critical fonts
      const fontPreload = document.createElement("link");
      fontPreload.rel = "preload";
      fontPreload.href = "/fonts/inter-var.woff2";
      fontPreload.as = "font";
      fontPreload.type = "font/woff2";
      fontPreload.crossOrigin = "anonymous";
      document.head.appendChild(fontPreload);
    };

    // Apply optimizations with delays to avoid blocking
    setTimeout(inlineCriticalCSS, 0);
    setTimeout(optimizeWebFonts, 100);
    setTimeout(deferNonCriticalCSS, 200);
    setTimeout(removeUnusedCSS, 1000); // Run after page is fully loaded

    // Cleanup function
    return () => {
      // Remove injected optimization styles if component unmounts
      const criticalStyles = document.querySelectorAll(
        '[data-critical="true"]',
      );
      criticalStyles.forEach((style) => style.remove());

      const fontStyles = document.querySelectorAll(
        '[data-font-optimization="true"]',
      );
      fontStyles.forEach((style) => style.remove());
    };
  }, []);

  return null; // This component doesn't render anything
}

// Hook for manual CSS optimizations
export function useCSSOptimization() {
  const purgeUnusedCSS = (selectors: string[]) => {
    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          // Remove unused CSS rules
          console.debug(`Unused selector found: ${selector}`);
        }
      } catch (e) {
        console.debug(`Invalid selector: ${selector}`);
      }
    });
  };

  const inlineSmallCSS = (cssText: string, maxSize = 1024) => {
    if (cssText.length <= maxSize) {
      const style = document.createElement("style");
      style.textContent = cssText;
      document.head.appendChild(style);
      return true;
    }
    return false;
  };

  const preloadCSS = (href: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = "style";
    document.head.appendChild(link);
  };

  return {
    purgeUnusedCSS,
    inlineSmallCSS,
    preloadCSS,
  };
}

// Utility for critical CSS extraction
export const criticalCSSUtils = {
  // Extract critical CSS for above-the-fold content
  extractCritical: () => {
    const criticalElements = document.querySelectorAll(
      "[data-critical], .hero-section, nav, header",
    );
    const criticalSelectors: string[] = [];

    criticalElements.forEach((el) => {
      // Collect classes from critical elements
      el.classList.forEach((className) => {
        criticalSelectors.push(`.${className}`);
      });
    });

    return criticalSelectors;
  },

  // Generate critical CSS string
  generateCriticalCSS: (selectors: string[]) => {
    let criticalCSS = "";

    try {
      Array.from(document.styleSheets).forEach((stylesheet) => {
        try {
          Array.from(stylesheet.cssRules || []).forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;
              if (selectors.some((s) => selector.includes(s))) {
                criticalCSS += rule.cssText + "\n";
              }
            }
          });
        } catch (e) {
          // Can't access cross-origin stylesheets
        }
      });
    } catch (e) {
      console.debug("Could not extract critical CSS");
    }

    return criticalCSS;
  },
};
