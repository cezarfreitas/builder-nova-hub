import { Request, Response } from 'express';
import { readSettingsFromFile } from './settings';

// Servir robots.txt dinâmico
export async function serveRobotsTxt(req: Request, res: Response) {
  try {
    const settings = await readSettingsFromFile();
    const robotsContent = settings.robots_txt?.value || `User-agent: *
Disallow: /admin
Allow: /

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsContent);
  } catch (error) {
    console.error('❌ Erro ao servir robots.txt:', error);
    res.status(500).send('Error serving robots.txt');
  }
}

// Servir sitemap.xml dinâmico
export async function serveSitemapXml(req: Request, res: Response) {
  try {
    const settings = await readSettingsFromFile();
    const canonicalUrl = settings.seo_canonical_url?.value || `${req.protocol}://${req.get('host')}`;
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/#sobre</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/#vantagens</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/#depoimentos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/#faq</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('❌ Erro ao servir sitemap.xml:', error);
    res.status(500).send('Error serving sitemap.xml');
  }
}

// Gerar meta tags para o head
export async function getMetaTags(req: Request, res: Response) {
  try {
    const settings = await readSettingsFromFile();
    const baseUrl = settings.seo_canonical_url?.value || `${req.protocol}://${req.get('host')}`;
    
    const metaTags = {
      // SEO Básico
      title: settings.seo_title?.value || 'Seja uma Revenda Autorizada da Ecko',
      description: settings.seo_description?.value || 'Junte-se à nossa rede de revendedores autorizados Ecko. Produtos exclusivos, suporte completo e oportunidade de crescimento.',
      keywords: settings.seo_keywords?.value || 'ecko, revendedor, streetwear, marca',
      canonical: settings.seo_canonical_url?.value || baseUrl,
      
      // Favicon
      favicon: settings.favicon_url?.value || '/favicon.ico',
      appleIcon: settings.apple_icon_url?.value || '/apple-touch-icon.png',
      
      // Open Graph
      ogTitle: settings.og_title?.value || settings.seo_title?.value || 'Seja uma Revenda Autorizada da Ecko',
      ogDescription: settings.og_description?.value || settings.seo_description?.value || 'Junte-se à nossa rede de revendedores autorizados Ecko.',
      ogImage: settings.og_image?.value || '/uploads/seo-default.png',
      ogUrl: settings.og_url?.value || baseUrl,
      ogType: settings.og_type?.value || 'website',
      
      // Twitter Cards
      twitterCard: settings.twitter_card?.value || 'summary_large_image',
      twitterTitle: settings.twitter_title?.value || settings.og_title?.value || settings.seo_title?.value,
      twitterDescription: settings.twitter_description?.value || settings.og_description?.value || settings.seo_description?.value,
      twitterImage: settings.twitter_image?.value || settings.og_image?.value || '/uploads/seo-default.png',
      
      // Schema.org
      schemaCompany: settings.schema_company_name?.value || 'Ecko',
      schemaPhone: settings.schema_contact_phone?.value || '',
      schemaEmail: settings.schema_contact_email?.value || '',
      schemaAddress: {
        street: settings.schema_address_street?.value || '',
        city: settings.schema_address_city?.value || '',
        state: settings.schema_address_state?.value || ''
      }
    };

    res.json({
      success: true,
      metaTags
    });
  } catch (error) {
    console.error('❌ Erro ao gerar meta tags:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar meta tags'
    });
  }
}

// Gerar structured data (JSON-LD)
export async function getStructuredData(req: Request, res: Response) {
  try {
    const settings = await readSettingsFromFile();
    const baseUrl = settings.seo_canonical_url?.value || `${req.protocol}://${req.get('host')}`;
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": settings.schema_company_name?.value || "Ecko",
      "url": baseUrl,
      "logo": settings.og_image?.value || `${baseUrl}/uploads/logo.png`,
      "description": settings.seo_description?.value || "Rede de revendedores autorizados Ecko",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": settings.schema_contact_phone?.value || "",
        "email": settings.schema_contact_email?.value || "",
        "contactType": "customer service",
        "availableLanguage": "Portuguese"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings.schema_address_street?.value || "",
        "addressLocality": settings.schema_address_city?.value || "",
        "addressRegion": settings.schema_address_state?.value || "",
        "addressCountry": "BR"
      },
      "sameAs": [
        "https://www.facebook.com/ecko",
        "https://www.instagram.com/ecko",
        "https://twitter.com/ecko"
      ]
    };

    res.json({
      success: true,
      structuredData
    });
  } catch (error) {
    console.error('❌ Erro ao gerar structured data:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar structured data'
    });
  }
}
