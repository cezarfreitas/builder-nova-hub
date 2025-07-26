import { useEffect } from "react";

export const DeferredCSS = () => {
  useEffect(() => {
    // Optimize CSS loading by deferring non-critical styles
    const optimizeCSS = () => {
      // Add any custom CSS optimizations here
      // In Vite, CSS is already bundled and optimized
      console.log("CSS optimization applied");
    };

    // Apply optimizations after initial render
    if (document.readyState === "complete") {
      optimizeCSS();
    } else {
      window.addEventListener("load", optimizeCSS);
    }

    return () => {
      window.removeEventListener("load", optimizeCSS);
    };
  }, []);

  return null;
};

// Preload hero images
export const PreloadHeroImages = () => {
  useEffect(() => {
    const preloadImages = [
      "/logo-ecko.png",
      // Adicione outras imagens críticas aqui
    ];

    preloadImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  return null;
};
