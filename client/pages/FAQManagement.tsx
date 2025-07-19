import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { FAQ, FAQsResponse, FAQUpdateResponse } from "@shared/api";

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/faqs");
      const data: FAQsResponse = await response.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao carregar FAQs" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      display_order: 0,
      is_active: true,
    });
    setEditingFaq(null);
  };

  const openModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order,
        is_active: faq.is_active,
      });
    } else {
      resetForm();
      setFormData((prev) => ({
        ...prev,
        display_order: faqs.length + 1,
      }));
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      setMessage({
        type: "error",
        text: "Pergunta e resposta são obrigatórias",
      });
      return;
    }

    try {
      const url = editingFaq ? `/api/faqs/${editingFaq.id}` : "/api/faqs";
      const method = editingFaq ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: FAQUpdateResponse = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingFaq
            ? "FAQ atualizado com sucesso!"
            : "FAQ criado com sucesso!",
        });
        fetchFAQs();
        closeModal();
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erro ao salvar FAQ",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const toggleFAQStatus = async (id: number) => {
    try {
      const response = await fetch(`/api/faqs/${id}/toggle`, {
        method: "PUT",
      });

      const data: FAQUpdateResponse = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message,
        });
        fetchFAQs();
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erro ao alterar status",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const deleteFAQ = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este FAQ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "FAQ deletado com sucesso!",
        });
        fetchFAQs();
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erro ao deletar FAQ",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const moveOrder = async (id: number, direction: "up" | "down") => {
    const faqIndex = faqs.findIndex((f) => f.id === id);
    if (faqIndex === -1) return;

    const newOrder =
      direction === "up"
        ? faqs[faqIndex].display_order - 1
        : faqs[faqIndex].display_order + 1;

    if (newOrder < 1) return;

    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...faqs[faqIndex],
          display_order: newOrder,
        }),
      });

      if (response.ok) {
        fetchFAQs();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao reordenar FAQ" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-ecko-red" />
            <span className="text-gray-600">Carregando FAQs...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Perguntas Frequentes
              </h1>
              <p className="text-gray-600 mt-2">
                Configure as perguntas frequentes da landing page
              </p>
            </div>
            <Button
              onClick={() => openModal()}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo FAQ
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de FAQs
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {faqs.length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    FAQs Ativos
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {faqs.filter((f) => f.is_active).length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    FAQs Inativos
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {faqs.filter((f) => !f.is_active).length}
                  </p>
                </div>
                <EyeOff className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            {faqs.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum FAQ encontrado</p>
                <Button
                  onClick={() => openModal()}
                  className="mt-4 bg-ecko-red hover:bg-ecko-red-dark text-white"
                >
                  Criar Primeiro FAQ
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Pergunta</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {faq.display_order}
                            </span>
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveOrder(faq.id!, "up")}
                                className="p-1 h-6"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveOrder(faq.id!, "down")}
                                className="p-1 h-6"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate" title={faq.question}>
                            {faq.question}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate" title={faq.answer}>
                            {faq.answer}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={faq.is_active ? "default" : "secondary"}
                            className={
                              faq.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {faq.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal(faq)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFAQStatus(faq.id!)}
                              className={
                                faq.is_active
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-green-600 hover:text-green-800"
                              }
                            >
                              {faq.is_active ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFAQ(faq.id!)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal for Create/Edit */}
        <Dialog open={showModal} onOpenChange={closeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFaq ? "Editar FAQ" : "Criar Novo FAQ"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Ordem de Exibição</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-300 text-ecko-red focus:ring-ecko-red"
                  />
                  <Label htmlFor="is_active">FAQ Ativo</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="question">Pergunta *</Label>
                <Input
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Digite a pergunta"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="answer">Resposta *</Label>
                <Textarea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  placeholder="Digite a resposta"
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={closeModal}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-ecko-red hover:bg-ecko-red-dark text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingFaq ? "Atualizar" : "Criar"} FAQ
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
