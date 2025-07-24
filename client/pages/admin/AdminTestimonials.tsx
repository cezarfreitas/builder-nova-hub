import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Testimonial } from "@shared/api";
import { SmartImageUpload } from "../../components/SmartImageUpload";
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
  X
} from "lucide-react";

export default function AdminTestimonials() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    content: '',
    avatar_url: '',
    rating: 5,
    is_active: true,
    display_order: 0
  });

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      const result = await response.json();

      if (result.success) {
        setTestimonials(result.data.testimonials);
      } else {
        toast({
          title: "❌ Erro",
          description: "Erro ao carregar depoimentos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao carregar depoimentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      role: '',
      content: '',
      avatar_url: '',
      rating: 5,
      is_active: true,
      display_order: 0
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      company: testimonial.company || '',
      role: testimonial.role || '',
      content: testimonial.content,
      avatar_url: testimonial.avatar_url || '',
      rating: testimonial.rating,
      is_active: testimonial.is_active,
      display_order: testimonial.display_order || 0
    });
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingTestimonial 
        ? `/api/testimonials/${editingTestimonial.id}`
        : '/api/testimonials';
      
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Sucesso",
          description: editingTestimonial 
            ? "Depoimento atualizado com sucesso"
            : "Depoimento criado com sucesso",
          variant: "success",
        });
        resetForm();
        fetchTestimonials();
      } else {
        toast({
          title: "❌ Erro",
          description: result.message || "Erro ao salvar depoimento",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar depoimento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (testimonial: Testimonial) => {
    if (!confirm(`Tem certeza que deseja excluir o depoimento de "${testimonial.name}"?`)) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Sucesso",
          description: "Depoimento excluído com sucesso",
          variant: "success",
        });
        fetchTestimonials();
      } else {
        toast({
          title: "❌ Erro",
          description: result.message || "Erro ao excluir depoimento",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar depoimento:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir depoimento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}/toggle`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Sucesso",
          description: result.message,
          variant: "success",
        });
        fetchTestimonials();
      } else {
        toast({
          title: "❌ Erro",
          description: result.message || "Erro ao alterar status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao toggle depoimento:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao alterar status",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecko-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando depoimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Depoimentos</h1>
          <p className="text-gray-600 mt-2">
            Adicione, edite ou remova os depoimentos de revendedores satisfeitos.
          </p>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className="bg-ecko-red hover:bg-ecko-red-dark text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Depoimento
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-ecko-red" />
                {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                    placeholder="Nome completo do cliente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                    placeholder="Nome da empresa/loja"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo/Função
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                    placeholder="Ex: Proprietário, Gerente, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar do Cliente
                  </label>
                  <SmartImageUpload
                    value={formData.avatar_url}
                    onChange={(url) => setFormData({ ...formData, avatar_url: url })}
                    type="avatar"
                    placeholder="Upload da foto do cliente (opcional)"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                  >
                    <option value={5}>5 Estrelas</option>
                    <option value={4}>4 Estrelas</option>
                    <option value={3}>3 Estrelas</option>
                    <option value={2}>2 Estrelas</option>
                    <option value={1}>1 Estrela</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depoimento *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                  rows={4}
                  placeholder="Escreva o depoimento aqui..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-ecko-red bg-gray-100 border-gray-300 rounded focus:ring-ecko-red focus:ring-2"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Ativo (visível na landing page)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-ecko-red hover:bg-ecko-red-dark text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : editingTestimonial ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Depoimentos */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-ecko-red" />
            Lista de Depoimentos ({testimonials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">Nenhum depoimento encontrado</p>
              <p className="text-sm text-gray-400">Clique em "Novo Depoimento" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {testimonial.avatar_url ? (
                          <img
                            src={testimonial.avatar_url}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=dc2626&color=ffffff&size=48&bold=true`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-ecko-red rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {testimonial.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                          {testimonial.company && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">
                                {testimonial.role && `${testimonial.role}, `}{testimonial.company}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>

                        {/* Depoimento */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          "{testimonial.content}"
                        </p>

                        {/* Metadados */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Ordem: {testimonial.display_order || 0}</span>
                          <span>•</span>
                          <span>
                            Criado em: {new Date(testimonial.created_at!).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge
                            className={testimonial.is_active 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                            }
                          >
                            {testimonial.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(testimonial)}
                        disabled={saving}
                        title={testimonial.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {testimonial.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(testimonial)}
                        disabled={saving}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(testimonial)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
