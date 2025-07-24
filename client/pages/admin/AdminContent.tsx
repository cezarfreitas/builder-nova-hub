import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { useContent, ContentData } from '../../hooks/useContent';
import { Save, RotateCcw, FileText, Eye } from 'lucide-react';

export default function AdminContent() {
  const { content, loading, saveContent, resetToDefaults } = useContent();
  const { toast } = useToast();
  const [editedContent, setEditedContent] = useState<ContentData>(content);
  const [activeSection, setActiveSection] = useState<keyof ContentData>('hero');

  const handleSave = async () => {
    const result = await saveContent(editedContent);
    if (result.success) {
      toast({
        title: "✅ Conteúdo salvo!",
        description: "As alterações foram aplicadas com sucesso.",
      });
    } else {
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setEditedContent(content);
    toast({
      title: "🔄 Conteúdo resetado",
      description: "Todos os textos voltaram aos valores padrão.",
    });
  };

  const updateSection = (section: keyof ContentData, field: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const sections = [
    { key: 'hero' as const, label: 'Hero Section', icon: '🏠' },
    { key: 'benefits' as const, label: 'Benefícios', icon: '⭐' },
    { key: 'testimonials' as const, label: 'Depoimentos', icon: '💬' },
    { key: 'gallery' as const, label: 'Galeria', icon: '🖼️' },
    { key: 'faq' as const, label: 'FAQ', icon: '❓' },
    { key: 'final_cta' as const, label: 'CTA Final', icon: '🎯' },
  ];

  const renderSectionFields = () => {
    const section = editedContent[activeSection];
    
    return Object.entries(section).map(([field, value]) => (
      <div key={field} className="space-y-2">
        <label className="block text-sm font-semibold text-gray-300 mb-2 capitalize">
          {field.replace(/_/g, ' ')}
        </label>
        {field.includes('description') || field.length > 50 ? (
          <textarea
            value={value as string}
            onChange={(e) => updateSection(activeSection, field, e.target.value)}
            className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none resize-vertical"
            rows={3}
          />
        ) : (
          <Input
            value={value as string}
            onChange={(e) => updateSection(activeSection, field, e.target.value)}
            className="h-12 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
          />
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">
                Gerenciar Conteúdo
              </h1>
              <p className="text-gray-400">
                Edite todos os textos e configurações da landing page
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <FileText className="w-4 h-4 mr-2" />
                Modo JSON
              </Badge>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Seções */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Seções</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`w-full text-left px-4 py-3 transition-colors duration-200 ${
                        activeSection === section.key
                          ? 'bg-ecko-red text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <span className="mr-3">{section.icon}</span>
                      {section.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área de Edição */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {sections.find(s => s.key === activeSection)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderSectionFields()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Link */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
            onClick={() => window.open('/', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar Landing Page
          </Button>
        </div>
      </div>
    </div>
  );
}
