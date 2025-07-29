import { Request, Response } from 'express';
import { getDatabase } from "../config/database";

// Função para buscar configuração específica do MySQL
async function getSettingValue(key: string): Promise<string | null> {
  try {
    const db = getDatabase();
    const [rows] = await db.execute(
      `SELECT setting_value FROM lp_settings WHERE setting_key = ?`,
      [key]
    );
    const results = rows as any[];
    return results.length > 0 ? results[0].setting_value : null;
  } catch (error) {
    console.error(`Erro ao buscar configuração ${key}:`, error);
    return null;
  }
}

// Função para buscar múltiplas configurações do MySQL
async function getMultipleSettings(keys: string[]): Promise<Record<string, string | null>> {
  try {
    const db = getDatabase();
    const placeholders = keys.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT setting_key, setting_value FROM lp_settings WHERE setting_key IN (${placeholders})`,
      keys
    );
    const results = rows as any[];
    const settings: Record<string, string | null> = {};
    
    keys.forEach(key => {
      settings[key] = null;
    });
    
    results.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error(`Erro ao buscar configurações:`, error);
    return {};
  }
}

// Servir robots.txt dinâmico
export async function serveRobotsTxt(req: Request, res: Response) {
  try {
    const robotsContent = await getSettingValue("robots_txt") || `User-agent: *
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
    const canonicalUrl = await getSettingValue("seo_canonical_url") || `${req.protocol}://${req.get('host')}`;
    
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
    const settingKeys = [
      'seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url',
      'favicon_url', 'apple_icon_url', 'og_title', 'og_description', 'og_image',
      'og_url', 'og_type', 'twitter_card', 'twitter_title', 'twitter_description',
      'twitter_image', 'schema_company_name', 'schema_contact_phone',
      'schema_contact_email', 'schema_address_street', 'schema_address_city',
      'schema_address_state'
    ];
    
    const settings = await getMultipleSettings(settingKeys);
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    const baseUrl = settings.seo_canonical_url || `${protocol}://${host}`;

    const metaTags = {
      // SEO Básico
      title: settings.seo_title || 'Seja uma Revenda Autorizada da Ecko',
      description: settings.seo_description || 'Junte-se à nossa rede de revendedores autorizados Ecko. Produtos exclusivos, suporte completo e oportunidade de crescimento.',
      keywords: settings.seo_keywords || 'ecko, revendedor, streetwear, marca',
      canonical: settings.seo_canonical_url || baseUrl,
      
      // Favicon
      favicon: settings.favicon_url || '/favicon.ico',
      appleIcon: settings.apple_icon_url || '/apple-touch-icon.png',
      
      // Open Graph
      ogTitle: settings.og_title || settings.seo_title || 'Seja uma Revenda Autorizada da Ecko',
      ogDescription: settings.og_description || settings.seo_description || 'Junte-se à nossa rede de revendedores autorizados Ecko.',
      ogImage: settings.og_image || '/uploads/seo-default.png',
      ogUrl: settings.og_url || baseUrl,
      ogType: settings.og_type || 'website',
      
      // Twitter Cards
      twitterCard: settings.twitter_card || 'summary_large_image',
      twitterTitle: settings.twitter_title || settings.og_title || settings.seo_title,
      twitterDescription: settings.twitter_description || settings.og_description || settings.seo_description,
      twitterImage: settings.twitter_image || settings.og_image || '/uploads/seo-default.png',
      
      // Schema.org
      schemaCompany: settings.schema_company_name || 'Ecko',
      schemaPhone: settings.schema_contact_phone || '',
      schemaEmail: settings.schema_contact_email || '',
      schemaAddress: {
        street: settings.schema_address_street || '',
        city: settings.schema_address_city || '',
        state: settings.schema_address_state || ''
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
    const settingKeys = [
      'seo_canonical_url', 'schema_company_name', 'og_image', 'seo_description',
      'schema_contact_phone', 'schema_contact_email', 'schema_address_street',
      'schema_address_city', 'schema_address_state'
    ];
    
    const settings = await getMultipleSettings(settingKeys);
    const baseUrl = settings.seo_canonical_url || `${req.protocol}://${req.get('host')}`;
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": settings.schema_company_name || "Ecko",
      "url": baseUrl,
      "logo": settings.og_image || `${baseUrl}/uploads/logo.png`,
      "description": settings.seo_description || "Rede de revendedores autorizados Ecko",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": settings.schema_contact_phone || "",
        "email": settings.schema_contact_email || "",
        "contactType": "customer service",
        "availableLanguage": "Portuguese"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings.schema_address_street || "",
        "addressLocality": settings.schema_address_city || "",
        "addressRegion": settings.schema_address_state || "",
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
