import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import { GalleryImage } from "@shared/api";
import { SmartImageUpload } from "../../components/SmartImageUpload";
import {
  Image,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
  Upload,
  Images
} from "lucide-react";

export default function AdminGallery() {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMultiUpload, setShowMultiUpload] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [processingUploads, setProcessingUploads] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    alt_text: '',
    is_active: true,
    display_order: 0
  });

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      const result = await response.json();

      if (result.success) {
        setImages(result.data.images);
      } else {
        toast({
          title: "❌ Erro",
          description: "Erro ao carregar imagens da galeria",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao carregar imagens da galeria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      alt_text: '',
      is_active: true,
      display_order: 0
    });
    setEditingImage(null);
    setShowForm(false);
  };

  const resetMultiUpload = () => {
    setShowMultiUpload(false);
    setUploadingImages([]);
    setProcessingUploads(false);
  };

  const handleMultiImageUpload = (imageUrl: string) => {
    setUploadingImages(prev => [...prev, imageUrl]);
  };

  const removeUploadedImage = (imageUrl: string) => {
    setUploadingImages(prev => prev.filter(url => url !== imageUrl));
  };

  const saveMultipleImages = async () => {
    if (uploadingImages.length === 0) {
      toast({
        title: "❌ Erro",
        description: "Nenhuma imagem foi selecionada",
        variant: "destructive",
      });
      return;
    }

    setProcessingUploads(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Processa cada imagem
      for (let i = 0; i < uploadingImages.length; i++) {
        const imageUrl = uploadingImages[i];
        const nextOrder = Math.max(...images.map(img => img.display_order || 0), 0) + i + 1;

        try {
          const response = await fetch('/api/gallery', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `Imagem ${i + 1}`,
              description: '',
              image_url: imageUrl,
              alt_text: `Imagem da galeria lifestyle ${i + 1}`,
              is_active: true,
              display_order: nextOrder
            }),
          });

          const result = await response.json();

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "✅ Sucesso",
          description: `${successCount} ${successCount === 1 ? 'imagem adicionada' : 'imagens adicionadas'} com sucesso${errorCount > 0 ? ` (${errorCount} falharam)` : ''}`,
          variant: "success",
        });
        resetMultiUpload();
        fetchImages();
      } else {
        toast({
          title: "❌ Erro",
          description: "Não foi possível adicionar nenhuma imagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no upload múltiplo:', error);
      toast({
        title: "❌ Erro",
        description: "Erro inesperado no upload múltiplo",
        variant: "destructive",
      });
    } finally {
      setProcessingUploads(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setFormData({
      title: image.title,
      description: image.description || '',
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      is_active: image.is_active,
      display_order: image.display_order || 0
    });
    setEditingImage(image);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      toast({
        title: "❌ Erro",
        description: "É necessário fazer upload de uma imagem",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const url = editingImage 
        ? `/api/gallery/${editingImage.id}`
        : '/api/gallery';
      
      const method = editingImage ? 'PUT' : 'POST';

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
          description: editingImage 
            ? "Imagem atualizada com sucesso"
            : "Imagem adicionada com sucesso",
          variant: "success",
        });
        resetForm();
        fetchImages();
      } else {
        toast({
          title: "❌ Erro",
          description: result.message || "Erro ao salvar imagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar imagem",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm(`Tem certeza que deseja excluir a imagem "${image.title}"?`)) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/gallery/${image.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Sucesso",
          description: "Imagem excluída com sucesso",
          variant: "success",
        });
        fetchImages();
      } else {
        toast({
          title: "❌ Erro",
          description: result.message || "Erro ao excluir imagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir imagem",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (image: GalleryImage) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/gallery/${image.id}/toggle`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Sucesso",
          description: result.message,
          variant: "success",
        });
        fetchImages();
      } else {
        toast({
          title: "❌ Erro",
          description: result.message || "Erro ao alterar status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao toggle imagem:', error);
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
          <p className="mt-4 text-gray-600">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Galeria Lifestyle</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as imagens que aparecem na seção "Coleção Lifestyle" da home.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowMultiUpload(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Images className="w-4 h-4 mr-2" />
            Upload Múltiplo
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-ecko-red hover:bg-ecko-red-dark text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Imagem
          </Button>
        </div>
      </div>

      {/* Upload Múltiplo */}
      {showMultiUpload && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Images className="w-6 h-6 mr-2 text-green-600" />
                Upload Múltiplo de Imagens
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetMultiUpload}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📸 Upload Simplificado</h4>
                <p className="text-sm text-blue-700">
                  Faça upload de múltiplas imagens de uma vez. Títulos e descrições serão gerados automaticamente.
                  Você pode editar os detalhes de cada imagem posteriormente se necessário.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adicionar Imagens
                </label>
                <SmartImageUpload
                  value=""
                  onChange={handleMultiImageUpload}
                  type="gallery"
                  placeholder="Arraste múltiplas imagens ou clique para selecionar (max 5MB cada)"
                />
              </div>

              {uploadingImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Imagens Selecionadas ({uploadingImages.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadingImages.map((imageUrl, index) => (
                      <div key={imageUrl} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeUploadedImage(imageUrl)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          type="button"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveMultipleImages}
                  disabled={processingUploads || uploadingImages.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {processingUploads ? 'Processando...' : `Salvar ${uploadingImages.length} ${uploadingImages.length === 1 ? 'Imagem' : 'Imagens'}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetMultiUpload}
                  disabled={processingUploads}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário */}
      {showForm && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Image className="w-6 h-6 mr-2 text-ecko-red" />
                {editingImage ? 'Editar Imagem' : 'Nova Imagem'}
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
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                    placeholder="Título da imagem (ex: Streetwear Masculino)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Alternativo
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                    placeholder="Descrição para acessibilidade"
                  />
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
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                  rows={3}
                  placeholder="Descrição da imagem (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem da Galeria *
                </label>
                <SmartImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  type="gallery"
                  placeholder="Upload da imagem para galeria lifestyle (max 5MB)"
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
                  {saving ? 'Salvando...' : editingImage ? 'Atualizar' : 'Adicionar'}
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

      {/* Grid de Imagens */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="w-6 h-6 mr-2 text-ecko-red" />
            Galeria Lifestyle ({images.length} imagens)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">Nenhuma imagem encontrada</p>
              <p className="text-sm text-gray-400">Clique em "Nova Imagem" para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Imagem */}
                  <div className="relative">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || image.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=Erro+ao+carregar';
                      }}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={image.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                        }
                      >
                        {image.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>

                    {/* Ordem */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        #{image.display_order || 0}
                      </Badge>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {image.description}
                      </p>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(image)}
                        disabled={saving}
                        title={image.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {image.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(image)}
                        disabled={saving}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(image)}
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

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Dicas para Galeria Lifestyle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">📷 Imagens</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Use imagens quadradas (500x500px ideal)</li>
                <li>• Máximo 5MB por imagem</li>
                <li>• Imagens são compactadas automaticamente</li>
                <li>• Prefira alta qualidade e boa iluminação</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 Conteúdo</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Mostre produtos em uso real</li>
                <li>• Varie estilos: masculino, feminino, urbano</li>
                <li>• Use ordem para priorizar melhores fotos</li>
                <li>• Máximo 12 imagens são exibidas na home</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
