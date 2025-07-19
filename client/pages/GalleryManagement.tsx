import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import AdminLayout from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Move,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  GalleryImage,
  GalleryResponse,
  GalleryImageResponse,
} from "@shared/api";
import SimpleImageUpload from "../components/SimpleImageUpload";

type ViewMode = "grid" | "list";
type SortField = "created_at" | "title" | "display_order";
type SortOrder = "asc" | "desc";

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("display_order");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    alt_text: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gallery");
      const data: GalleryResponse = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const openDialog = (image?: GalleryImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title,
        description: image.description || "",
        image_url: image.image_url,
        alt_text: image.alt_text || "",
        display_order: image.display_order || 0,
        is_active: image.is_active !== false,
      });
    } else {
      setEditingImage(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        alt_text: "",
        display_order: images.length + 1,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingImage
        ? `/api/gallery/${editingImage.id}`
        : "/api/gallery";
      const method = editingImage ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchImages();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchImages();
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (response.ok) {
        await fetchImages();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete",
  ) => {
    if (selectedImages.size === 0) return;

    const imageIds = Array.from(selectedImages);

    try {
      if (action === "delete") {
        await Promise.all(
          imageIds.map((id) =>
            fetch(`/api/gallery/${id}`, { method: "DELETE" }),
          ),
        );
      } else {
        const isActive = action === "activate";
        await Promise.all(
          imageIds.map((id) =>
            fetch(`/api/gallery/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ is_active: isActive }),
            }),
          ),
        );
      }
      await fetchImages();
      setSelectedImages(new Set());
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const toggleImageSelection = (id: number) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.id!)));
    }
  };

  // Filter and sort images
  const filteredImages = images
    .filter((image) => {
      const matchesSearch =
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (image.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && image.is_active) ||
        (statusFilter === "inactive" && !image.is_active);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        case "display_order":
        default:
          aValue = a.display_order || 0;
          bValue = b.display_order || 0;
          break;
      }

      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === "asc" ? result : -result;
    });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2">Carregando galeria...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Galeria de Imagens
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie as imagens da sua galeria
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="flex items-center gap-2"
            >
              {viewMode === "grid" ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid3X3 className="w-4 h-4" />
              )}
              {viewMode === "grid" ? "Lista" : "Grade"}
            </Button>
            <Button
              onClick={() => openDialog()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Imagem
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por título ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={`${sortField}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-") as [
                    SortField,
                    SortOrder,
                  ];
                  setSortField(field);
                  setSortOrder(order);
                }}
              >
                <SelectTrigger className="w-48">
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4 mr-2" />
                  ) : (
                    <SortDesc className="w-4 h-4 mr-2" />
                  )}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="display_order-asc">Ordem ↑</SelectItem>
                  <SelectItem value="display_order-desc">Ordem ↓</SelectItem>
                  <SelectItem value="title-asc">Título A-Z</SelectItem>
                  <SelectItem value="title-desc">Título Z-A</SelectItem>
                  <SelectItem value="created_at-desc">Mais Recentes</SelectItem>
                  <SelectItem value="created_at-asc">Mais Antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedImages.size > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedImages.size} imagem(ns) selecionada(s)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("activate")}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ativar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("deactivate")}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Desativar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkAction("delete")}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {images.length}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {images.filter((img) => img.is_active).length}
                  </p>
                  <p className="text-sm text-gray-600">Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {images.filter((img) => !img.is_active).length}
                  </p>
                  <p className="text-sm text-gray-600">Inativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredImages.length}
                  </p>
                  <p className="text-sm text-gray-600">Filtradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Images Display */}
        {filteredImages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma imagem encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros ou busca."
                  : "Comece adicionando a primeira imagem à galeria."}
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Imagem
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id!)}
                      onChange={() => toggleImageSelection(image.id!)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant={image.is_active ? "default" : "secondary"}>
                      {image.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {/* Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || image.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image.image_url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openDialog(image)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {image.title}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(image)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleStatus(image.id!, image.is_active)
                            }
                          >
                            {image.is_active ? (
                              <EyeOff className="w-4 h-4 mr-2" />
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            {image.is_active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(image.image_url, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Original
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{image.title}
                                  "? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(image.id!)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {image.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {image.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Ordem: {image.display_order}</span>
                      <span>
                        {new Date(image.created_at || "").toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View - Compact Table */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedImages.size === filteredImages.length &&
                            filteredImages.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600"
                        />
                      </th>
                      <th className="p-4 text-left">Imagem</th>
                      <th className="p-4 text-left">Título</th>
                      <th className="p-4 text-left">Descrição</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Ordem</th>
                      <th className="p-4 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredImages.map((image) => (
                      <tr key={image.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id!)}
                            onChange={() => toggleImageSelection(image.id!)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="p-4">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || image.title}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        </td>
                        <td className="p-4 font-medium">{image.title}</td>
                        <td className="p-4 text-gray-600 max-w-xs truncate">
                          {image.description || "-"}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={image.is_active ? "default" : "secondary"}
                          >
                            {image.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="p-4">{image.display_order}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDialog(image)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleStatus(image.id!, image.is_active)
                              }
                            >
                              {image.is_active ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirmar exclusão
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir "
                                    {image.title}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(image.id!)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Editar Imagem" : "Nova Imagem"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <SimpleImageUpload
                value={formData.image_url}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image_url: url }))
                }
                label="Imagem da Galeria"
                placeholder="URL da imagem ou faça upload"
                description="Selecione uma imagem para a galeria"
                usedFor="gallery"
                previewHeight="h-64"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Título da imagem"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="alt_text">Texto Alternativo</Label>
                  <Input
                    id="alt_text"
                    name="alt_text"
                    value={formData.alt_text}
                    onChange={handleInputChange}
                    placeholder="Descrição para acessibilidade"
                  />
                </div>

                <div>
                  <Label htmlFor="display_order">Ordem de Exibição</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="is_active">Ativar imagem</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição da imagem (opcional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingImage ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
