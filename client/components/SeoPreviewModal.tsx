import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SeoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  seoData: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    siteName: string;
    canonicalUrl: string;
  };
}

export function SeoPreviewModal({ isOpen, onClose, seoData }: SeoPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Preview de SEO</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="p-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Google Search Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Search
            </h3>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="text-xs text-green-700">
                    {seoData.canonicalUrl || 'https://revendedores.ecko.com.br/'}
                  </div>
                  <h3 className="text-lg text-blue-600 hover:underline cursor-pointer font-normal">
                    {seoData.title || 'Título da página'}
                  </h3>
                  <p className="text-sm text-gray-600 leading-5">
                    {seoData.description || 'Meta description da página...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facebook Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </h3>
            <Card className="border border-gray-300 max-w-lg">
              <CardContent className="p-0">
                <div className="aspect-[1200/630] bg-gray-100 flex items-center justify-center border-b border-gray-200">
                  {seoData.ogImage ? (
                    <img 
                      src={seoData.ogImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm">Imagem OG</p>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs text-gray-500 uppercase mb-1">
                    {seoData.siteName || 'Ecko Revendedores'}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {seoData.ogTitle || seoData.title || 'Título Open Graph'}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {seoData.ogDescription || seoData.description || 'Descrição Open Graph'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Twitter Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </h3>
            <Card className="border border-gray-300 max-w-lg">
              <CardContent className="p-0">
                <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center border-b border-gray-200">
                  {seoData.ogImage ? (
                    <img 
                      src={seoData.ogImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-xs">Imagem</p>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {seoData.twitterTitle || seoData.ogTitle || seoData.title || 'Título Twitter'}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {seoData.ogDescription || seoData.description || 'Descrição para Twitter'}
                  </p>
                  <div className="text-xs text-gray-500">
                    {seoData.canonicalUrl || 'revendedores.ecko.com.br'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meta Tags Code */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Código HTML das Meta Tags
            </h3>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">
{`<!-- SEO Básico -->
<title>${seoData.title || 'Título da página'}</title>
<meta name="description" content="${seoData.description || 'Meta description'}" />
<link rel="canonical" href="${seoData.canonicalUrl || 'https://revendedores.ecko.com.br/'}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${seoData.ogTitle || seoData.title || 'Título OG'}" />
<meta property="og:description" content="${seoData.ogDescription || seoData.description || 'Descrição OG'}" />
<meta property="og:image" content="${seoData.ogImage || 'URL da imagem'}" />
<meta property="og:url" content="${seoData.canonicalUrl || 'https://revendedores.ecko.com.br/'}" />
<meta property="og:site_name" content="${seoData.siteName || 'Ecko Revendedores'}" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${seoData.twitterTitle || seoData.ogTitle || seoData.title || 'Título Twitter'}" />
<meta name="twitter:description" content="${seoData.ogDescription || seoData.description || 'Descrição Twitter'}" />
<meta name="twitter:image" content="${seoData.ogImage || 'URL da imagem'}" />`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(`<!-- SEO Meta Tags -->
<title>${seoData.title || 'Título da página'}</title>
<meta name="description" content="${seoData.description || 'Meta description'}" />
<link rel="canonical" href="${seoData.canonicalUrl || 'https://revendedores.ecko.com.br/'}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${seoData.ogTitle || seoData.title || 'Título OG'}" />
<meta property="og:description" content="${seoData.ogDescription || seoData.description || 'Descrição OG'}" />
<meta property="og:image" content="${seoData.ogImage || 'URL da imagem'}" />
<meta property="og:url" content="${seoData.canonicalUrl || 'https://revendedores.ecko.com.br/'}" />
<meta property="og:site_name" content="${seoData.siteName || 'Ecko Revendedores'}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${seoData.twitterTitle || seoData.ogTitle || seoData.title || 'Título Twitter'}" />
<meta name="twitter:description" content="${seoData.ogDescription || seoData.description || 'Descrição Twitter'}" />
<meta name="twitter:image" content="${seoData.ogImage || 'URL da imagem'}" />`);
            }}
          >
            Copiar Código
          </Button>
          <Button onClick={onClose} className="bg-ecko-red hover:bg-ecko-red-dark text-white">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
