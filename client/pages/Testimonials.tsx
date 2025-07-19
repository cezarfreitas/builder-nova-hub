import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import AdminLayout from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Testimonial, TestimonialsResponse } from "@shared/api";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  MessageSquare,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface TestimonialFormData {
  name: string;
  company: string;
  role: string;
  content: string;
  avatar_url: string;
  rating: number;
  is_active: boolean;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: "",
    company: "",
    role: "",
    content: "",
    avatar_url: "",
    rating: 5,
    is_active: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/testimonials");
      const data: TestimonialsResponse = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setTestimonials([]);
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
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseInt(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial.id}`
        : "/api/testimonials";
      const method = editingTestimonial ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTestimonials();
        resetForm();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao salvar depoimento");
      }
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Erro ao salvar depoimento");
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      company: testimonial.company || "",
      role: testimonial.role || "",
      content: testimonial.content,
      avatar_url: testimonial.avatar_url || "",
      rating: testimonial.rating,
      is_active: testimonial.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este depoimento?")) {
      try {
        const response = await fetch(`/api/testimonials/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchTestimonials();
        } else {
          alert("Erro ao excluir depoimento");
        }
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        alert("Erro ao excluir depoimento");
      }
    }
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...testimonial,
          is_active: !testimonial.is_active,
        }),
      });

      if (response.ok) {
        await fetchTestimonials();
      }
    } catch (error) {
      console.error("Error toggling testimonial status:", error);
    }
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: "",
      company: "",
      role: "",
      content: "",
      avatar_url: "",
      rating: 5,
      is_active: true,
    });
  };

  const activeTestimonials = testimonials.filter((t) => t.is_active).length;

    return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Depoimentos
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie os depoimentos de clientes da landing page
            </p>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Depoimentos
                  </p>
                  <p className="text-3xl font-bold text-ecko-gray">
                    {testimonials.length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-ecko-red" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {activeTestimonials}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {testimonials.length - activeTestimonials}
                  </p>
                </div>
                <Users className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gerenciar Depoimentos</span>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-ecko-red hover:bg-ecko-red-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Depoimento
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Testimonials Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa/Cargo</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Depoimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : testimonials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhum depoimento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {testimonial.avatar_url ? (
                              <img
                                src={testimonial.avatar_url}
                                alt={testimonial.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {testimonial.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{testimonial.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {testimonial.company && (
                              <p className="font-medium">
                                {testimonial.company}
                              </p>
                            )}
                            {testimonial.role && (
                              <p className="text-sm text-gray-600">
                                {testimonial.role}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              ({testimonial.rating})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-xs truncate">
                            {testimonial.content}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(testimonial)}
                            className="p-1"
                          >
                            {testimonial.is_active ? (
                              <Badge className="bg-green-100 text-green-800 flex items-center">
                                <ToggleRight className="w-4 h-4 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 flex items-center">
                                <ToggleLeft className="w-4 h-4 mr-1" />
                                Inativo
                              </Badge>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {testimonial.created_at
                            ? new Date(
                                testimonial.created_at,
                              ).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(testimonial)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(testimonial.id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonial Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo/Função
                </label>
                <Input
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Ex: CEO, Gerente, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Foto
                </label>
                <Input
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depoimento *
              </label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Escreva o depoimento do cliente..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avaliação (1-5 estrelas)
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-10 border border-gray-300 rounded-md px-3 bg-white"
                >
                  <option value={1}>1 ⭐</option>
                  <option value={2}>2 ⭐⭐</option>
                  <option value={3}>3 ⭐⭐⭐</option>
                  <option value={4}>4 ⭐⭐⭐⭐</option>
                  <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Ativo (visível no site)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-ecko-red hover:bg-ecko-red-dark"
              >
                {editingTestimonial ? "Atualizar" : "Criar"} Depoimento
              </Button>
            </div>
          </form>
        </DialogContent>
            </Dialog>
      </div>
    </AdminLayout>
  );
}