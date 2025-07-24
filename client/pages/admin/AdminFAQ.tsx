import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
  FileText,
  MessageCircle,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
}

interface FAQSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  items: FAQItem[];
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
}

export default function AdminFAQ() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<FAQSettings>(content.faq);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"perguntas" | "textos">("perguntas");
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validation, setValidation] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.faq) {
      setSettings(content.faq);
    }
  }, [content.faq]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.faq);
    setHasChanges(hasChanges);
  }, [settings, content.faq]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        faq: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "FAQ atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar FAQ:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar campo de texto
  const updateField = (field: keyof FAQSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Adicionar nova pergunta
  const addFAQ = () => {
    const newId = Math.max(...settings.items.map(faq => faq.id), 0) + 1;
    const newFAQ: FAQItem = {
      id: newId,
      question: "",
      answer: "",
      is_active: true,
      display_order: settings.items.length + 1
    };

    setSettings(prev => ({
      ...prev,
      items: [...prev.items, newFAQ]
    }));
    setEditingFAQ(newFAQ);
    setShowForm(true);
  };

  // Editar pergunta
  const editFAQ = (faq: FAQItem) => {
    setEditingFAQ(faq);
    setShowForm(true);
  };

  // Salvar pergunta editada
  const saveFAQ = (faq: FAQItem) => {
    // Validação básica
    if (!faq.question.trim() || !faq.answer.trim()) {
      toast({
        title: "Erro de validação",
        description: "Pergunta e resposta são obrigatórias.",
        variant: "destructive",
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === faq.id ? faq : item
      )
    }));
    setShowForm(false);
    setEditingFAQ(null);
  };

  // Excluir pergunta
  const deleteFAQ = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
      setSettings(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
      toast({
        title: "Pergunta excluída",
        description: "A pergunta foi removida com sucesso.",
      });
    }
  };

  // Toggle ativo/inativo
  const toggleFAQ = (id: number) => {
    setSettings(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, is_active: !item.is_active } : item
      )
    }));
  };

  // Reordenar perguntas
  const reorderFAQs = (fromIndex: number, toIndex: number) => {
    const newItems = [...settings.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Atualizar display_order
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));

    setSettings(prev => ({
      ...prev,
      items: reorderedItems
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
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-gray-600">Gerencie as perguntas frequentes e textos da seção</p>
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
            onClick={() => setActiveTab('perguntas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'perguntas'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <HelpCircle className="w-4 h-4 mr-2 inline" />
            Perguntas
          </button>
          <button
            onClick={() => setActiveTab('textos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'textos'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 mr-2 inline" />
            Textos da Seção
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'perguntas' ? (
        <div className="space-y-6">
          {/* Add Button */}
          <div className="flex justify-end">
            <Button onClick={addFAQ} className="bg-ecko-red hover:bg-ecko-red-dark">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {settings.items
              .sort((a, b) => a.display_order - b.display_order)
              .map((faq, index) => (
              <Card key={faq.id} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="cursor-grab mt-1">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{faq.display_order}
                          </span>
                          <Badge variant={faq.is_active ? "default" : "secondary"}>
                            {faq.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {faq.question || "Pergunta sem título"}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {faq.answer || "Resposta não definida"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        {faq.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editFAQ(faq)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFAQ(faq.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {settings.items.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma pergunta cadastrada</p>
                <p className="text-sm">Clique em "Adicionar Pergunta" para começar</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {settings.items.length > 0 && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-ecko-red" />
                  Preview das Perguntas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {settings.items
                    .filter(faq => faq.is_active)
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((faq) => (
                    <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                      <AccordionTrigger className="text-left">
                        {renderTextWithColorTokens(faq.question)}
                      </AccordionTrigger>
                      <AccordionContent>
                        {renderTextWithColorTokens(faq.answer)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Textos da Seção
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-ecko-red" />
                Textos da Seção FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tag da Seção
                </label>
                <TokenColorEditor
                  value={settings.section_tag}
                  onChange={(value) => updateField('section_tag', value)}
                  placeholder="Ex: Dúvidas Frequentes"
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
                  onChange={(value) => updateField('section_title', value)}
                  placeholder="Ex: Perguntas [Frequentes]"
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
                  onChange={(value) => updateField('section_subtitle', value)}
                  placeholder="Ex: tire suas dúvidas"
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
                  onChange={(value) => updateField('section_description', value)}
                  placeholder="Descreva a seção de perguntas frequentes..."
                  rows={3}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título do CTA
                </label>
                <TokenColorEditor
                  value={settings.cta_title}
                  onChange={(value) => updateField('cta_title', value)}
                  placeholder="Ex: Ainda tem dúvidas?"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição do CTA
                </label>
                <TokenColorEditor
                  value={settings.cta_description}
                  onChange={(value) => updateField('cta_description', value)}
                  placeholder="Ex: Nossa equipe está pronta para esclarecer..."
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão CTA
                </label>
                <TokenColorEditor
                  value={settings.cta_button_text}
                  onChange={(value) => updateField('cta_button_text', value)}
                  placeholder="Ex: FALAR COM ESPECIALISTA"
                  rows={2}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Edição */}
      {showForm && editingFAQ && (
        <FAQForm
          faq={editingFAQ}
          onSave={saveFAQ}
          onClose={() => {
            setShowForm(false);
            setEditingFAQ(null);
          }}
        />
      )}
    </div>
  );
}

// Componente para formulário de FAQ
function FAQForm({ 
  faq, 
  onSave, 
  onClose 
}: { 
  faq: FAQItem;
  onSave: (faq: FAQItem) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<FAQItem>(faq);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {formData.id ? 'Editar Pergunta' : 'Nova Pergunta'}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pergunta *
            </label>
            <Input
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Digite a pergunta"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resposta *
            </label>
            <Textarea
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              placeholder="Digite a resposta completa"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-ecko-red hover:bg-ecko-red-dark">
              <Save className="w-4 h-4 mr-2" />
              Salvar Pergunta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
