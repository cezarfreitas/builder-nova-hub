import { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

export function DynamicHead() {
  const { getSetting, loading } = useSettings();

  useEffect(() => {
    if (loading) return;

    // Atualizar title
    const title = getSetting('seo_title');
    if (title) {
      document.title = title;
    }

    // Função para atualizar ou criar meta tag
    const updateMetaTag = (name: string, content: string, property?: string) => {
      if (!content) return;
      
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', name);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
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
    
    // Facebook
    const facebookAppId = getSetting('facebook_app_id');
    if (facebookAppId) {
      updateMetaTag('', facebookAppId, 'fb:app_id');
    }

    // Twitter Card
    updateMetaTag('twitter:card', getSetting('twitter_card') || 'summary_large_image');
    updateMetaTag('twitter:title', getSetting('twitter_title') || getSetting('og_title') || getSetting('seo_title'));
    updateMetaTag('twitter:description', getSetting('twitter_description') || getSetting('og_description') || getSetting('seo_description'));
    updateMetaTag('twitter:image', getSetting('twitter_image') || getSetting('og_image'));
    
    const twitterSite = getSetting('twitter_site');
    if (twitterSite) {
      updateMetaTag('twitter:site', twitterSite);
    }
    
    const twitterCreator = getSetting('twitter_creator');
    if (twitterCreator) {
      updateMetaTag('twitter:creator', twitterCreator);
    }

    // Schema.org (JSON-LD)
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
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Adicionar novo script
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

  }, [getSetting, loading]);

  // Effect para preloading do logo e outras imagens importantes
  useEffect(() => {
    const addPreloadLink = (href: string, as: string = 'image') => {
      // Verificar se já existe
      const existingLink = document.querySelector(`link[rel="preload"][href="${href}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (as === 'image') {
        link.type = 'image/*';
      }
      document.head.appendChild(link);
    };

    // Preload do logo padrão imediatamente na inicialização
    const defaultLogo = "https://www.ntktextil.com.br/wp-content/uploads/2022/08/Logo-Ecko.png";
    addPreloadLink(defaultLogo);

    // Preload imagem de fundo padrão
    const defaultBackground = "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png?v=638421392678800000";
    addPreloadLink(defaultBackground);

  }, []);

  return null; // Este componente não renderiza nada visível
}
