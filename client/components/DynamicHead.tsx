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

    // Atualizar link canonical
    const updateCanonical = (href: string) => {
      if (!href) return;
      
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', href);
    };

    // SEO Básico
    updateMetaTag('description', getSetting('seo_description'));
    updateMetaTag('keywords', getSetting('seo_keywords'));
    updateMetaTag('robots', getSetting('seo_robots') || 'index,follow');
    updateCanonical(getSetting('seo_canonical_url'));

    // Open Graph
    updateMetaTag('', getSetting('og_type') || 'website', 'og:type');
    updateMetaTag('', getSetting('og_title') || getSetting('seo_title'), 'og:title');
    updateMetaTag('', getSetting('og_description') || getSetting('seo_description'), 'og:description');
    updateMetaTag('', getSetting('og_image'), 'og:image');
    updateMetaTag('', getSetting('seo_canonical_url'), 'og:url');
    updateMetaTag('', getSetting('og_site_name') || 'Ecko Revendedores', 'og:site_name');
    
    // Facebook
    const facebookAppId = getSetting('facebook_app_id');
    if (facebookAppId) {
      updateMetaTag('', facebookAppId, 'fb:app_id');
    }

    // Twitter Card
    updateMetaTag('twitter:card', getSetting('twitter_card') || 'summary_large_image');
    updateMetaTag('twitter:title', getSetting('twitter_title') || getSetting('og_title') || getSetting('seo_title'));
    updateMetaTag('twitter:description', getSetting('og_description') || getSetting('seo_description'));
    updateMetaTag('twitter:image', getSetting('og_image'));
    
    const twitterSite = getSetting('twitter_site');
    if (twitterSite) {
      updateMetaTag('twitter:site', twitterSite);
    }
    
    const twitterCreator = getSetting('twitter_creator');
    if (twitterCreator) {
      updateMetaTag('twitter:creator', twitterCreator);
    }

    // Schema.org (JSON-LD)
    const schemaOrgName = getSetting('schema_org_name');
    const schemaOrgLogo = getSetting('schema_org_logo');
    const schemaOrgPhone = getSetting('schema_org_phone');
    const schemaOrgType = getSetting('schema_org_type') || 'Organization';
    
    if (schemaOrgName) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": schemaOrgType,
        "name": schemaOrgName,
        "url": getSetting('seo_canonical_url') || window.location.origin,
      };

      if (schemaOrgLogo) {
        (schemaData as any).logo = schemaOrgLogo;
      }

      if (schemaOrgPhone) {
        (schemaData as any).telephone = schemaOrgPhone;
      }

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

  return null; // Este componente não renderiza nada visível
}
