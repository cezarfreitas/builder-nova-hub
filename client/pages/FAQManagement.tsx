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
  DialogTrigger,
} from "../components/ui/dialog";
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
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { FAQ, FAQsResponse, FAQUpdateResponse } from "@shared/api";

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
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
      if (response.ok) {
        const data: FAQsResponse = await response.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setIsLoading(false);
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
      const url = editingFAQ ? `/api/faqs/${editingFAQ.id}` : "/api/faqs";
      const method = editingFAQ ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchFAQs();
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchFAQs();
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await fetch(`/api/faqs/${id}/toggle`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchFAQs();
      }
    } catch (error) {
      console.error("Error toggling FAQ status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      display_order: 0,
      is_active: true,
    });
    setEditingFAQ(null);
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active,
    });
    setShowForm(true);
  };

  const openCreateDialog = () => {
    resetForm();
    // Set next display order
    const maxOrder = Math.max(...faqs.map((f) => f.display_order), 0);
    setFormData((prev) => ({ ...prev, display_order: maxOrder + 1 }));
    setShowForm(true);
  };

  const activeFAQs = faqs.filter((f) => f.is_active).length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-gray-600">Carregando FAQs...</span>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar FAQs</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as perguntas frequentes da landing page
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFAQ ? "Editar FAQ" : "Nova FAQ"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pergunta *</label>
                  <Input
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Digite a pergunta"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resposta *</label>
                  <Textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    placeholder="Digite a resposta"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Ordem de Exibição
                    </label>
                    <Input
                      name="display_order"
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <label className="text-sm">Ativo (visível no site)</label>
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
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    {editingFAQ ? "Atualizar" : "Criar"} FAQ
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <HelpCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {activeFAQs}
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
                  <p className="text-sm font-medium text-gray-600">Inativas</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {faqs.length - activeFAQs}
                  </p>
                </div>
                <EyeOff className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            {faqs.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma FAQ encontrada</p>
                <Button
                  onClick={openCreateDialog}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar primeira FAQ
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                            <Badge variant="outline">{faq.display_order}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium max-w-sm">
                              {faq.question}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-md truncate text-gray-600">
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
                              {faq.is_active ? "Ativa" : "Inativa"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(faq)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(faq.id!)}
                              >
                                {faq.is_active ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirmar exclusão
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir esta FAQ?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(faq.id!)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
