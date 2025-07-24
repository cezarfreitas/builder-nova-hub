import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import { SmartImageUpload } from "../../components/SmartImageUpload";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  User,
  Building,
  GripVertical,
  Save,
  X,
  FileText,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";

interface TestimonialItem {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  avatar_url: string;
  rating: number;
  is_active: boolean;
  display_order: number;
}

interface TestimonialsSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  items: TestimonialItem[];
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
}

export default function AdminTestimonials() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<TestimonialsSettings>(content.testimonials);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'depoimentos' | 'textos'>('depoimentos');
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validation, setValidation] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.testimonials) {
      setSettings(content.testimonials);
    }
  }, [content.testimonials]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.testimonials);
    setHasChanges(hasChanges);
  }, [settings, content.testimonials]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        testimonials: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Depoimentos atualizados!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar depoimentos:", error);
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
  const updateField = (field: keyof TestimonialsSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Adicionar novo depoimento
  const addTestimonial = () => {
    const newId = Math.max(...settings.items.map(t => t.id), 0) + 1;
    const newTestimonial: TestimonialItem = {
      id: newId,
      name: "",
      company: "",
      role: "",
      content: "",
      avatar_url: "",
      rating: 5,
      is_active: true,
      display_order: settings.items.length + 1
    };

    setSettings(prev => ({
      ...prev,
      items: [...prev.items, newTestimonial]
    }));
    setEditingTestimonial(newTestimonial);
    setShowForm(true);
  };

  // Editar depoimento
  const editTestimonial = (testimonial: TestimonialItem) => {
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  // Salvar depoimento editado
  const saveTestimonial = (testimonial: TestimonialItem) => {
    // Validação básica
    if (!testimonial.name.trim() || !testimonial.content.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === testimonial.id ? testimonial : item
      )
    }));
    setShowForm(false);
    setEditingTestimonial(null);
  };

  // Excluir depoimento
  const deleteTestimonial = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este depoimento?")) {
      setSettings(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
      toast({
        title: "Depoimento excluído",
        description: "O depoimento foi removido com sucesso.",
      });
    }
  };

  // Toggle ativo/inativo
  const toggleTestimonial = (id: number) => {
    setSettings(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, is_active: !item.is_active } : item
      )
    }));
  };

  // Reordenar depoimentos
  const reorderTestimonials = (fromIndex: number, toIndex: number) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Depoimentos</h1>
          <p className="text-gray-600">Gerencie os depoimentos e textos da seção</p>
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
            onClick={() => setActiveTab('depoimentos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'depoimentos'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2 inline" />
            Depoimentos
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
      {activeTab === 'depoimentos' ? (
        <div className="space-y-6">
          {/* Add Button */}
          <div className="flex justify-end">
            <Button onClick={addTestimonial} className="bg-ecko-red hover:bg-ecko-red-dark">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Depoimento
            </Button>
          </div>

          {/* Testimonials List */}
          <div className="grid gap-4">
            {settings.items
              .sort((a, b) => a.display_order - b.display_order)
              .map((testimonial, index) => (
              <Card key={testimonial.id} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="cursor-grab">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      {testimonial.avatar_url && (
                        <img
                          src={testimonial.avatar_url}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                          <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                            {testimonial.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          <div className="flex items-center">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          {testimonial.role} - {testimonial.company}
                        </p>
                        
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {testimonial.content}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTestimonial(testimonial.id)}
                      >
                        {testimonial.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editTestimonial(testimonial)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTestimonial(testimonial.id)}
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
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum depoimento cadastrado</p>
                <p className="text-sm">Clique em "Adicionar Depoimento" para começar</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Textos da Seção
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-ecko-red" />
                Textos da Seção de Depoimentos
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
                  placeholder="Ex: Depoimentos"
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
                  placeholder="Ex: O que nossos revendedores dizem"
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
                  placeholder="Ex: casos reais de sucesso"
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
                  placeholder="Descreva a seção de depoimentos..."
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
                  placeholder="Ex: Seja o próximo case de sucesso!"
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
                  placeholder="Ex: Junte-se aos revendedores que já transformaram seus negócios"
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
                  placeholder="Ex: QUERO SER UM CASE DE SUCESSO"
                  rows={2}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Edição */}
      {showForm && editingTestimonial && (
        <TestimonialForm
          testimonial={editingTestimonial}
          onSave={saveTestimonial}
          onClose={() => {
            setShowForm(false);
            setEditingTestimonial(null);
          }}
        />
      )}
    </div>
  );
}

// Componente para formulário de depoimento
function TestimonialForm({ 
  testimonial, 
  onSave, 
  onClose 
}: { 
  testimonial: TestimonialItem;
  onSave: (testimonial: TestimonialItem) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<TestimonialItem>(testimonial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {formData.id ? 'Editar Depoimento' : 'Novo Depoimento'}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Empresa
              </label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Nome da empresa"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cargo
            </label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="Cargo ou função"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Depoimento *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Escreva o depoimento aqui..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Foto do Cliente
            </label>
            <SmartImageUpload
              value={formData.avatar_url}
              onChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
              uploadEndpoint="/api/uploads/avatar"
              folder="avatars"
              aspectRatio="1:1"
              maxWidth={300}
              maxHeight={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Avaliação
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} estrela{rating > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
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
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-ecko-red hover:bg-ecko-red-dark">
              <Save className="w-4 h-4 mr-2" />
              Salvar Depoimento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
