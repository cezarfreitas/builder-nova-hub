import { useEffect } from "react";

export const CSSOptimizer = () => {
  useEffect(() => {
    // Carregar CSS não crítico de forma assíncrona
    const loadCSS = (href: string) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.media = "print"; // Carregar como print primeiro para não bloquear
      link.onload = () => {
        link.media = "all"; // Depois aplicar para all
      };
      document.head.appendChild(link);
    };

    // Precarregar CSS crítico se ainda não estiver carregado
    const criticalCSS = document.querySelector('link[href*="index-"]');
    if (!criticalCSS) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "style";
      link.href = "/assets/index-BK1U9X6L.css";
      link.onload = () => {
        const styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = "/assets/index-BK1U9X6L.css";
        document.head.appendChild(styleLink);
      };
      document.head.appendChild(link);
    }

    // Otimizar fontes
    const optimizeFonts = () => {
      // Precarregar fonte mais importante
      const fontLink = document.createElement("link");
      fontLink.rel = "preload";
      fontLink.as = "font";
      fontLink.type = "font/woff2";
      fontLink.crossOrigin = "anonymous";
      fontLink.href =
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2";
      document.head.appendChild(fontLink);
    };

    optimizeFonts();

    // Limpar resources não utilizados após carregamento
    const cleanup = () => {
      // Remover preloads não utilizados após 5 segundos
      setTimeout(() => {
        const unusedPreloads = document.querySelectorAll('link[rel="preload"]');
        unusedPreloads.forEach((link) => {
          const href = link.getAttribute("href");
          if (
            href &&
            !document.querySelector(`link[rel="stylesheet"][href="${href}"]`)
          ) {
            // Se o preload não foi convertido em stylesheet, remover
            link.remove();
          }
        });
      }, 5000);
    };

    cleanup();
  }, []);

  return null;
};
