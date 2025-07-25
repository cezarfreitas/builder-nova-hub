import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import {
  Award,
  Save,
  Type,
  AlertCircle,
  Loader2,
  MousePointer,
  Lightbulb,
} from "lucide-react";

interface BenefitCard {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface BenefitsSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  cards: BenefitCard[];
  cta_title: string;
  cta_button_text: string;
}

export default function AdminBenefits() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<BenefitsSettings>(content.benefits);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'textos' | 'cards' | 'cta'>('textos');
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.benefits) {
      setSettings(content.benefits);
    }
  }, [content.benefits]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.benefits);
    setHasChanges(hasChanges);
  }, [settings, content.benefits]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        benefits: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Benefícios atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações de benefits:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar campo específico
  const updateField = (field: keyof BenefitsSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Atualizar card específico
  const updateCard = (
    cardId: number,
    field: keyof BenefitCard,
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card,
      ),
    }));
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-ecko-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benefícios</h1>
          <p className="text-gray-600">Gerencie os benefícios e vantagens da seção</p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Alterações pendentes
            </Badge>
            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="bg-ecko-red hover:bg-ecko-red-dark"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('textos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'textos'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Type className="w-4 h-4 mr-2 inline" />
            Textos
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cards'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award className="w-4 h-4 mr-2 inline" />
            Cards
          </button>
          <button
            onClick={() => setActiveTab('cta')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cta'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MousePointer className="w-4 h-4 mr-2 inline" />
            CTA
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'textos' ? (
        <div className="space-y-6">
          {/* Color Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900 text-sm">Destaque de Texto</h4>
              </div>
              <p className="text-blue-700 text-xs mb-3">
                Use <code className="bg-blue-100 px-1 rounded text-blue-800">{"{ecko}texto{/ecko}"}</code> em qualquer campo de texto para destacar palavras.
              </p>
              
              {/* Color Examples */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-blue-600 mr-2">Cores:</span>
                {[
                  { name: 'ecko', color: '#dc2626' },
                  { name: 'blue', color: '#2563eb' },
                  { name: 'green', color: '#16a34a' },
                  { name: 'orange', color: '#ea580c' },
                  { name: 'yellow', color: '#ca8a04' },
                  { name: 'white', color: '#ffffff' },
                  { name: 'black', color: '#000000' }
                ].map(({ name, color }) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                    style={{
                      backgroundColor: color === '#ffffff' ? '#f8f9fa' : color,
                      color: ['#ffffff', '#ca8a04'].includes(color) ? '#000000' : '#ffffff',
                      borderColor: color === '#ffffff' ? '#d1d5db' : color
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Textos da Seção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Textos da Seção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tag da Seção
                </label>
                <TokenColorEditor
                  value={settings.section_tag}
                  onChange={(value) => updateField("section_tag", value)}
                  placeholder="Ex: Por que escolher a Ecko?"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título Principal
                </label>
                <TokenColorEditor
                  value={settings.section_title}
                  onChange={(value) => updateField("section_title", value)}
                  placeholder="Ex: VANTAGENS EXCLUSIVAS"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtítulo
                </label>
                <TokenColorEditor
                  value={settings.section_subtitle}
                  onChange={(value) => updateField("section_subtitle", value)}
                  placeholder="Ex: para nossos parceiros"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição da Seção
                </label>
                <TokenColorEditor
                  value={settings.section_description}
                  onChange={(value) => updateField("section_description", value)}
                  placeholder="Descreva os benefícios únicos da marca..."
                  rows={4}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'cards' ? (
        <div className="space-y-6">
          {/* Benefits Cards */}
          {settings.cards?.map((card, index) => (
            <Card key={card.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-ecko-red" />
                    Card {index + 1}
                  </span>
                  <Badge variant="outline">Ícone: {card.icon}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Título do Card
                  </label>
                  <TokenColorEditor
                    value={card.title}
                    onChange={(value) => updateCard(card.id, "title", value)}
                    placeholder="Ex: MARCA INTERNACIONAL"
                    rows={2}
                    label=""
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição do Card
                  </label>
                  <TokenColorEditor
                    value={card.description}
                    onChange={(value) => updateCard(card.id, "description", value)}
                    placeholder="Descreva o benefício em detalhes..."
                    rows={4}
                    label=""
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // CTA
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MousePointer className="w-5 h-5 mr-2 text-ecko-red" />
                Call to Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título do CTA
                </label>
                <TokenColorEditor
                  value={settings.cta_title}
                  onChange={(value) => updateField("cta_title", value)}
                  placeholder="Ex: Junte-se a milhares de parceiros..."
                  rows={3}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão
                </label>
                <TokenColorEditor
                  value={settings.cta_button_text}
                  onChange={(value) => updateField("cta_button_text", value)}
                  placeholder="Ex: QUERO FAZER PARTE AGORA"
                  rows={2}
                  label=""
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900 text-sm">Informação</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Esta seção gerencia tanto os textos principais quanto os cards
                  de benefícios individuais. Você pode editar os títulos e
                  descrições de cada card na aba "Cards".
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
