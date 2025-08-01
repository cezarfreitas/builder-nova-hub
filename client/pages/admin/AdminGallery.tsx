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
import { useGallery } from "../../hooks/useGallery";
import { SmartImageUpload } from "../../components/SmartImageUpload";
import { MultiImageUpload } from "../../components/MultiImageUpload";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
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
  Images,
  FileText,
  Settings,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface GalleryItem {
  id: number;
  title?: string;
  description?: string;
  image_url: string;
  alt_text?: string;
  is_active: boolean;
  display_order: number;
}

interface GallerySettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  items: GalleryItem[];
  empty_state_title: string;
  empty_state_description: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
}

export default function AdminGallery() {
  const {
    gallery,
    loading: galleryLoading,
    saveGallerySettings,
    addImage: addImageToDb,
    updateImage: updateImageInDb,
    deleteImage: deleteImageFromDb,
    toggleImage: toggleImageInDb,
    reorderImages: reorderImagesInDb
  } = useGallery();
  const [settings, setSettings] = useState<GallerySettings>(gallery);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"galeria" | "textos">("galeria");
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  // Sincronizar com os dados da galeria quando carregados
  useEffect(() => {
    if (gallery) {
      setSettings(gallery);
    }
  }, [gallery]);

  // Detectar mudanças (apenas nos textos)
  useEffect(() => {
    const textFields = {
      section_tag: settings.section_tag,
      section_title: settings.section_title,
      section_subtitle: settings.section_subtitle,
      section_description: settings.section_description,
      empty_state_title: settings.empty_state_title,
      empty_state_description: settings.empty_state_description,
      cta_title: settings.cta_title,
      cta_description: settings.cta_description,
      cta_button_text: settings.cta_button_text
    };
    const galleryTextFields = {
      section_tag: gallery.section_tag,
      section_title: gallery.section_title,
      section_subtitle: gallery.section_subtitle,
      section_description: gallery.section_description,
      empty_state_title: gallery.empty_state_title,
      empty_state_description: gallery.empty_state_description,
      cta_title: gallery.cta_title,
      cta_description: gallery.cta_description,
      cta_button_text: gallery.cta_button_text
    };
    const hasChanges = JSON.stringify(textFields) !== JSON.stringify(galleryTextFields);
    setHasChanges(hasChanges);
  }, [settings, gallery]);

  // Salvar configurações de texto
  const saveSettings = async () => {
    try {
      setSaving(true);

      const result = await saveGallerySettings(settings);

      if (result.success) {
        toast({
          title: "Galeria atualizada!",
          description: "As configurações de texto foram salvas com sucesso no banco de dados.",
        });
        setHasChanges(false);
      } else {
        throw new Error(result.error || "Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar galeria:", error);
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
  const updateField = (field: keyof GallerySettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Adicionar nova imagem
  const addImage = () => {
    const newImage: Omit<GalleryItem, 'id'> = {
      image_url: "",
      is_active: true,
      display_order: settings.items.length + 1,
    };

    setEditingImage({ ...newImage, id: 0 } as GalleryItem);
    setShowForm(true);
  };

  // Adicionar múltiplas imagens
  const addMultipleImages = async (urls: string[]) => {
    let successCount = 0;

    for (let index = 0; index < urls.length; index++) {
      const url = urls[index];
      const imageData: Omit<GalleryItem, 'id'> = {
        image_url: url,
        is_active: true,
        display_order: settings.items.length + index + 1,
      };

      const result = await addImageToDb(imageData);
      if (result.success) {
        successCount++;
      }
    }

    toast({
      title: "Imagens adicionadas!",
      description: `${successCount} ${successCount === 1 ? "imagem foi adicionada" : "imagens foram adicionadas"} à galeria.`,
    });
  };

  // Editar imagem
  const editImage = (image: GalleryItem) => {
    setEditingImage(image);
    setShowForm(true);
  };

  // Salvar imagem editada
  const saveImage = async (image: GalleryItem) => {
    // Validação básica - apenas imagem é obrigatória
    if (!image.image_url.trim()) {
      toast({
        title: "Erro de validação",
        description: "A imagem é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    let result;
    if (image.id === 0) {
      // Nova imagem
      const { id, ...imageData } = image;
      result = await addImageToDb(imageData);
    } else {
      // Atualizar imagem existente
      result = await updateImageInDb(image.id, image);
    }

    if (result.success) {
      toast({
        title: "Imagem salva!",
        description: "A imagem foi salva com sucesso.",
      });
      setShowForm(false);
      setEditingImage(null);
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.error || "Não foi possível salvar a imagem.",
        variant: "destructive",
      });
    }
  };

  // Excluir imagem
  const deleteImage = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta imagem?")) {
      const result = await deleteImageFromDb(id);

      if (result.success) {
        toast({
          title: "Imagem excluída",
          description: "A imagem foi removida do banco de dados.",
        });
      } else {
        toast({
          title: "Erro ao excluir",
          description: result.error || "Não foi possível excluir a imagem.",
          variant: "destructive",
        });
      }
    }
  };

  // Toggle ativo/inativo
  const toggleImage = async (id: number) => {
    const result = await toggleImageInDb(id);

    if (result.success) {
      toast({
        title: `Imagem ${result.data?.is_active ? "ativada" : "desativada"}`,
        description: "Status alterado com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao alterar status",
        description: result.error || "Não foi possível alterar o status.",
        variant: "destructive",
      });
    }
  };

  // Reordenar imagens
  const reorderImages = async (fromIndex: number, toIndex: number) => {
    const newItems = [...settings.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Atualizar display_order
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }));

    const result = await reorderImagesInDb(reorderedItems);

    if (!result.success) {
      toast({
        title: "Erro ao reordenar",
        description: result.error || "Não foi possível reordenar as imagens.",
        variant: "destructive",
      });
    }
  };

  if (galleryLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
          <p className="text-gray-600">
            Gerencie as imagens e textos da galeria
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-300"
            >
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
            onClick={() => setActiveTab("galeria")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "galeria"
                ? "border-ecko-red text-ecko-red"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Images className="w-4 h-4 mr-2 inline" />
            Imagens
          </button>
          <button
            onClick={() => setActiveTab("textos")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "textos"
                ? "border-ecko-red text-ecko-red"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="w-4 h-4 mr-2 inline" />
            Textos da Seção
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "galeria" ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <MultiImageUpload
                onUpload={addMultipleImages}
                maxFiles={20}
                maxSize={5}
                quality={0.85}
                maxWidth={1200}
                maxHeight={1200}
              />
            </CardContent>
          </Card>

          {/* Add Single Button */}
          <div className="flex justify-end">
            <Button onClick={addImage} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Imagem Individual
            </Button>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.items
              .sort((a, b) => a.display_order - b.display_order)
              .map((image, index) => (
                <Card
                  key={image.id}
                  className="bg-white border border-gray-200 overflow-hidden"
                >
                  <div className="relative">
                    {image.image_url ? (
                      <img
                        src={image.image_url}
                        alt={image.alt_text}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <div className="cursor-grab bg-white/80 rounded p-1">
                        <GripVertical className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>

                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={image.is_active ? "default" : "secondary"}
                      >
                        {image.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {image.title && (
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {image.title}
                      </h3>
                    )}
                    {image.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                    {!image.title && !image.description && (
                      <div className="mb-3 text-xs text-gray-500">
                        Imagem #{image.display_order}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Ordem: {image.display_order}
                      </span>

                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleImage(image.id)}
                        >
                          {image.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editImage(image)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteImage(image.id)}
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
              <div className="col-span-full text-center py-12 text-gray-500">
                <Images className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma imagem na galeria</p>
                <p className="text-sm">
                  Clique em "Adicionar Imagem" para começar
                </p>
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
                Textos da Seção de Galeria
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
                  placeholder="Ex: Lifestyle Gallery"
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
                  placeholder="Ex: COLEÇÃO LIFESTYLE"
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
                  placeholder="Ex: Viva o estilo Ecko"
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
                  onChange={(value) =>
                    updateField("section_description", value)
                  }
                  placeholder="Descreva a galeria..."
                  rows={3}
                  label=""
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Título do Estado Vazio
                  </label>
                  <TokenColorEditor
                    value={settings.empty_state_title}
                    onChange={(value) =>
                      updateField("empty_state_title", value)
                    }
                    placeholder="Ex: Galeria em Construção"
                    rows={2}
                    label=""
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição do Estado Vazio
                  </label>
                  <TokenColorEditor
                    value={settings.empty_state_description}
                    onChange={(value) =>
                      updateField("empty_state_description", value)
                    }
                    placeholder="Ex: Em breve nossa galeria estará repleta..."
                    rows={2}
                    label=""
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título do CTA
                </label>
                <TokenColorEditor
                  value={settings.cta_title}
                  onChange={(value) => updateField("cta_title", value)}
                  placeholder="Ex: Tenha Estes Produtos em Sua Loja!"
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
                  onChange={(value) => updateField("cta_description", value)}
                  placeholder="Ex: Produtos com alta demanda e excelente margem..."
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
                  onChange={(value) => updateField("cta_button_text", value)}
                  placeholder="Ex: QUERO ESSES PRODUTOS NA MINHA LOJA"
                  rows={2}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Edição */}
      {showForm && editingImage && (
        <ImageForm
          image={editingImage}
          onSave={saveImage}
          onClose={() => {
            setShowForm(false);
            setEditingImage(null);
          }}
        />
      )}
    </div>
  );
}

// Componente para formulário de imagem
function ImageForm({
  image,
  onSave,
  onClose,
}: {
  image: GalleryItem;
  onSave: (image: GalleryItem) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<GalleryItem>(image);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {formData.id ? "Editar Imagem" : "Nova Imagem"}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Título (opcional)
            </label>
            <Input
              value={formData.title || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Título da imagem (opcional)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descrição (opcional)
            </label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Descrição da imagem (opcional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Imagem *
            </label>
            <SmartImageUpload
              value={formData.image_url}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, image_url: url }))
              }
              uploadEndpoint="/api/upload/gallery"
              folder="gallery"
              aspectRatio="1:1"
              maxWidth={800}
              maxHeight={800}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Texto Alternativo (opcional)
            </label>
            <Input
              value={formData.alt_text || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, alt_text: e.target.value }))
              }
              placeholder="Descrição para acessibilidade (opcional)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={formData.is_active ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.value === "true",
                }))
              }
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
            <Button
              type="submit"
              className="bg-ecko-red hover:bg-ecko-red-dark"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Imagem
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
