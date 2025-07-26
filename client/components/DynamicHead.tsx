import { useEffect } from "react";
import { useJsonSettings } from "../hooks/useJsonSettings";
import { useContent } from "../hooks/useContent";

export function DynamicHead() {
  const { getSetting, loading, error } = useJsonSettings();
  const { content, loading: contentLoading } = useContent();

  useEffect(() => {
    if (loading) return;

    console.log("🔄 DynamicHead: Carregando configurações...");
    console.log("⚙️ DynamicHead: Settings loading:", loading, "error:", error);

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

    // Validar URL
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    // Atualizar link canonical
    const updateCanonical = (href: string) => {
<<<<<<< HEAD
      if (!href) {
        console.warn('⚠️  URL canônica não definida');
        return;
      }

      // Validar URL
      if (!isValidUrl(href)) {
        console.warn('⚠️  URL canônica inválida:', href);
        return;
      }

      // Remover canonical existente para evitar duplicatas
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.remove();
      }

      // Criar novo link canonical
      const canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', href);
      document.head.appendChild(canonicalLink);

      console.log('✅ URL canônica configurada:', href);
=======
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
      console.log("🖼️ updateFavicon chamada com:", href);

      if (!href) {
        console.log("❌ Favicon URL vazia, pulando...");
        return;
      }

      // Remover favicons existentes
      const existingFavicons = document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"]',
      );
      console.log(
        "🗑️ Removendo",
        existingFavicons.length,
        "favicons existentes",
      );
      existingFavicons.forEach((favicon) => favicon.remove());

      // Detectar tipo do arquivo
      let type = "image/x-icon";
      if (href.endsWith(".svg")) {
        type = "image/svg+xml";
      } else if (href.endsWith(".png")) {
        type = "image/png";
      } else if (href.endsWith(".jpg") || href.endsWith(".jpeg")) {
        type = "image/jpeg";
      }

      console.log("📎 Criando favicon com tipo:", type);

      // Criar novo favicon
      const faviconLink = document.createElement("link");
      faviconLink.setAttribute("rel", "icon");
      faviconLink.setAttribute("type", type);
      faviconLink.setAttribute("href", href);
      document.head.appendChild(faviconLink);
      console.log("✅ Favicon principal adicionado");

      // Adicionar também como shortcut icon para compatibilidade
      const shortcutLink = document.createElement("link");
      shortcutLink.setAttribute("rel", "shortcut icon");
      shortcutLink.setAttribute("type", type);
      shortcutLink.setAttribute("href", href);
      document.head.appendChild(shortcutLink);
      console.log("✅ Shortcut icon adicionado");
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
    };

    // Atualizar favicon
    const updateFavicon = (href: string) => {
      if (!href) return;

      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        faviconLink.setAttribute('type', 'image/x-icon');
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute('href', href);
    };

    // Atualizar Apple Touch Icon
    const updateAppleIcon = (href: string) => {
      if (!href) return;

      let appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.setAttribute('rel', 'apple-touch-icon');
        document.head.appendChild(appleLink);
      }
      appleLink.setAttribute('href', href);
    };

    // Adicionar headers para desabilitar cache
    const addNoCacheHeaders = () => {
      updateMetaTag('Cache-Control', 'no-cache, no-store, must-revalidate');
      updateMetaTag('Pragma', 'no-cache');
      updateMetaTag('Expires', '0');
    };

    // Desabilitar cache da página
    addNoCacheHeaders();

    // SEO Básico
<<<<<<< HEAD
    updateMetaTag('description', getSetting('seo_description'));
    updateMetaTag('keywords', getSetting('seo_keywords'));
    updateMetaTag('robots', getSetting('seo_robots') || 'index,follow');

    // URL Canônica com debug
    const canonicalUrl = getSetting('seo_canonical_url');
    console.log('🔍 Debug URL Canônica:', canonicalUrl);
    updateCanonical(canonicalUrl);

    // Favicon e Ícones
    updateFavicon(getSetting('favicon_url') || '/favicon.ico');
    updateAppleIcon(getSetting('apple_icon_url') || '/apple-touch-icon.png');

    // Open Graph
    updateMetaTag('', getSetting('og_type') || 'website', 'og:type');
    updateMetaTag('', getSetting('og_title') || getSetting('seo_title'), 'og:title');
    updateMetaTag('', getSetting('og_description') || getSetting('seo_description'), 'og:description');
    updateMetaTag('', getSetting('og_image'), 'og:image');
    updateMetaTag('', getSetting('og_url') || canonicalUrl, 'og:url');
    updateMetaTag('', getSetting('og_site_name') || 'Ecko Revendedores', 'og:site_name');
    
=======
    updateMetaTag("description", getSetting("seo", "seo_description"));
    updateMetaTag("keywords", getSetting("seo", "seo_keywords"));
    updateMetaTag("robots", getSetting("seo", "seo_robots") || "index,follow");
    updateCanonical(getSetting("seo", "seo_canonical_url"));

    // Favicon
    const faviconUrl = getSetting("general", "favicon_url");
    console.log("🖼️ DynamicHead: Aplicando favicon:", faviconUrl);
    updateFavicon(faviconUrl);

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

>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
    // Facebook
    const facebookAppId = getSetting("analytics", "facebook_app_id");
    if (facebookAppId) {
      updateMetaTag("", facebookAppId, "fb:app_id");
    }

    // Twitter Card
<<<<<<< HEAD
    updateMetaTag('twitter:card', getSetting('twitter_card') || 'summary_large_image');
    updateMetaTag('twitter:title', getSetting('twitter_title') || getSetting('og_title') || getSetting('seo_title'));
    updateMetaTag('twitter:description', getSetting('twitter_description') || getSetting('og_description') || getSetting('seo_description'));
    updateMetaTag('twitter:image', getSetting('twitter_image') || getSetting('og_image'));
    
    const twitterSite = getSetting('twitter_site');
=======
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
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
    if (twitterSite) {
      updateMetaTag("twitter:site", twitterSite);
    }

    const twitterCreator = getSetting("seo", "twitter_creator");
    if (twitterCreator) {
      updateMetaTag("twitter:creator", twitterCreator);
    }

    // Schema.org (JSON-LD)
<<<<<<< HEAD
    const schemaCompanyName = getSetting('schema_company_name');
    const schemaContactPhone = getSetting('schema_contact_phone');
    const schemaContactEmail = getSetting('schema_contact_email');
    const schemaAddressStreet = getSetting('schema_address_street');
    const schemaAddressCity = getSetting('schema_address_city');
    const schemaAddressState = getSetting('schema_address_state');

    if (schemaCompanyName) {
      const schemaData: any = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": schemaCompanyName,
        "url": canonicalUrl || window.location.origin,
        "logo": getSetting('og_image') || `${canonicalUrl || window.location.origin}/uploads/logo.png`,
        "description": getSetting('seo_description') || "Rede de revendedores autorizados"
=======
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
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
      };

      // Informações de contato
      if (schemaContactPhone || schemaContactEmail) {
        schemaData.contactPoint = {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "Portuguese"
        };

        if (schemaContactPhone) {
          schemaData.contactPoint.telephone = schemaContactPhone;
        }

        if (schemaContactEmail) {
          schemaData.contactPoint.email = schemaContactEmail;
        }
      }

      // Endereço
      if (schemaAddressStreet || schemaAddressCity || schemaAddressState) {
        schemaData.address = {
          "@type": "PostalAddress",
          "addressCountry": "BR"
        };

        if (schemaAddressStreet) {
          schemaData.address.streetAddress = schemaAddressStreet;
        }

        if (schemaAddressCity) {
          schemaData.address.addressLocality = schemaAddressCity;
        }

        if (schemaAddressState) {
          schemaData.address.addressRegion = schemaAddressState;
        }
      }

      // Redes sociais
      schemaData.sameAs = [
        "https://www.facebook.com/ecko",
        "https://www.instagram.com/ecko",
        "https://twitter.com/ecko"
      ];

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
    if (content.hero?.logo_url && content.hero.logo_url !== defaultLogo) {
      addPreloadLink(content.hero.logo_url);
    }

    // Preload imagem de fundo do hero
    if (content.hero?.background_image) {
      addPreloadLink(content.hero.background_image);
    } else {
      // Preload imagem de fundo padrão
      const defaultBackground =
        "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png?v=638421392678800000";
      addPreloadLink(defaultBackground);
    }
  }, [content.hero]);

  return null; // Este componente não renderiza nada visível
}
