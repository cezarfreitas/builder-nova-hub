import { useEffect } from "react";
import { useJsonSettings } from "../hooks/useJsonSettings";
import { useHeroSettings } from "../hooks/useHeroSettings";

export function DynamicHead() {
  const { getSetting, loading, error } = useJsonSettings();
  const {
    settings: heroSettings,
    loading: heroLoading,
    error: heroError,
  } = useHeroSettings();

  useEffect(() => {
    if (loading) return;

    // Atualizar title com fallback
    const title =
      getSetting("seo", "seo_title") ||
      "Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos";
    document.title = title;

    // Função para atualizar ou criar meta tag
    const updateMetaTag = (
      name: string,
      content: string,
      property?: string,
    ) => {
      if (!content) return;

      const selector = property
        ? `meta[property="${property}"]`
        : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;

      if (!metaTag) {
        metaTag = document.createElement("meta");
        if (property) {
          metaTag.setAttribute("property", property);
        } else {
          metaTag.setAttribute("name", name);
        }
        document.head.appendChild(metaTag);
      }

      metaTag.setAttribute("content", content);
    };

    // Atualizar link canonical
    const updateCanonical = (href: string) => {
      if (!href) return;

      let canonicalLink = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", href);
    };

    // Atualizar favicon
    const updateFavicon = (href: string) => {
      if (!href) return;

      // Remover favicons existentes
      const existingFavicons = document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"]',
      );
      existingFavicons.forEach((favicon) => favicon.remove());

      // Criar novo favicon
      const faviconLink = document.createElement("link");
      faviconLink.setAttribute("rel", "icon");
      faviconLink.setAttribute("type", "image/x-icon");
      faviconLink.setAttribute("href", href);
      document.head.appendChild(faviconLink);

      // Adicionar também como shortcut icon para compatibilidade
      const shortcutLink = document.createElement("link");
      shortcutLink.setAttribute("rel", "shortcut icon");
      shortcutLink.setAttribute("type", "image/x-icon");
      shortcutLink.setAttribute("href", href);
      document.head.appendChild(shortcutLink);
    };

    // SEO Básico
    updateMetaTag("description", getSetting("seo", "seo_description"));
    updateMetaTag("keywords", getSetting("seo", "seo_keywords"));
    updateMetaTag("robots", getSetting("seo", "seo_robots") || "index,follow");
    updateCanonical(getSetting("seo", "seo_canonical_url"));

    // Favicon
    updateFavicon(getSetting("general", "favicon_url"));

    // Open Graph
    updateMetaTag("", getSetting("seo", "og_type") || "website", "og:type");
    updateMetaTag(
      "",
      getSetting("seo", "og_title") || getSetting("seo", "seo_title"),
      "og:title",
    );
    updateMetaTag(
      "",
      getSetting("seo", "og_description") ||
        getSetting("seo", "seo_description"),
      "og:description",
    );
    updateMetaTag("", getSetting("seo", "og_image"), "og:image");
    updateMetaTag("", getSetting("seo", "seo_canonical_url"), "og:url");
    updateMetaTag(
      "",
      getSetting("seo", "og_site_name") || "Ecko Revendedores",
      "og:site_name",
    );

    // Facebook
    const facebookAppId = getSetting("analytics", "facebook_app_id");
    if (facebookAppId) {
      updateMetaTag("", facebookAppId, "fb:app_id");
    }

    // Twitter Card
    updateMetaTag(
      "twitter:card",
      getSetting("seo", "twitter_card") || "summary_large_image",
    );
    updateMetaTag(
      "twitter:title",
      getSetting("seo", "twitter_title") ||
        getSetting("seo", "og_title") ||
        getSetting("seo", "seo_title"),
    );
    updateMetaTag(
      "twitter:description",
      getSetting("seo", "og_description") ||
        getSetting("seo", "seo_description"),
    );
    updateMetaTag("twitter:image", getSetting("seo", "og_image"));

    const twitterSite = getSetting("seo", "twitter_site");
    if (twitterSite) {
      updateMetaTag("twitter:site", twitterSite);
    }

    const twitterCreator = getSetting("seo", "twitter_creator");
    if (twitterCreator) {
      updateMetaTag("twitter:creator", twitterCreator);
    }

    // Schema.org (JSON-LD)
    const schemaOrgName = getSetting("seo", "schema_company_name");
    const schemaOrgLogo = getSetting("seo", "schema_company_logo");
    const schemaOrgPhone = getSetting("seo", "schema_contact_phone");
    const schemaOrgType = "Organization";

    if (schemaOrgName) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": schemaOrgType,
        name: schemaOrgName,
        url: getSetting("seo", "seo_canonical_url") || window.location.origin,
      };

      if (schemaOrgLogo) {
        (schemaData as any).logo = schemaOrgLogo;
      }

      if (schemaOrgPhone) {
        (schemaData as any).telephone = schemaOrgPhone;
      }

      // Remover script anterior se existir
      const existingScript = document.querySelector(
        'script[type="application/ld+json"]',
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Adicionar novo script
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }
  }, [getSetting, loading]);

  // Effect para preloading do logo e outras imagens importantes
  useEffect(() => {
    const addPreloadLink = (href: string, as: string = "image") => {
      // Verificar se já existe
      const existingLink = document.querySelector(
        `link[rel="preload"][href="${href}"]`,
      );
      if (existingLink) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.as = as;
      if (as === "image") {
        link.type = "image/*";
      }
      document.head.appendChild(link);
    };

    // Preload do logo padrão imediatamente na inicialização
    const defaultLogo =
      "https://www.ntktextil.com.br/wp-content/uploads/2022/08/Logo-Ecko.png";
    addPreloadLink(defaultLogo);

    // Preload logo customizado apenas quando disponível e diferente
    if (heroSettings?.logo_url && heroSettings.logo_url !== defaultLogo) {
      addPreloadLink(heroSettings.logo_url);
    }

    // Preload imagem de fundo do hero
    if (heroSettings?.background_image) {
      addPreloadLink(heroSettings.background_image);
    } else {
      // Preload imagem de fundo padrão
      const defaultBackground =
        "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png?v=638421392678800000";
      addPreloadLink(defaultBackground);
    }
  }, [heroSettings]);

  return null; // Este componente não renderiza nada visível
}
