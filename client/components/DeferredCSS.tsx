import { useEffect } from 'react';

export const DeferredCSS = () => {
  useEffect(() => {
    // Defer non-critical CSS loading
    const deferCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './global.css';
      link.media = 'print';
      link.onload = function() {
        this.media = 'all';
      };
      document.head.appendChild(link);
    };

    // Load CSS after critical rendering
    if (document.readyState === 'complete') {
      deferCSS();
    } else {
      window.addEventListener('load', deferCSS);
    }

    return () => {
      window.removeEventListener('load', deferCSS);
    };
  }, []);

  return null;
};

// Preload hero images
export const PreloadHeroImages = () => {
  useEffect(() => {
    const preloadImages = [
      '/logo-ecko.png',
      // Adicione outras imagens críticas aqui
    ];

    preloadImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  return null;
};
