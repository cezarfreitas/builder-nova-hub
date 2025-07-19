import { RequestHandler } from "express";
import { Lead, LeadsResponse, LeadSubmissionResponse } from "@shared/api";
import { z } from "zod";

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  hasCnpj: z.string().min(1, "Informação sobre CNPJ é obrigatória"),
  storeType: z.string().min(1, "Tipo de loja é obrigatório"),
});

// In-memory storage for development (replace with MySQL later)
let leads: Lead[] = [];
let nextId = 1;

// POST /api/leads - Submit a new lead
export const submitLead: RequestHandler = (req, res) => {
  try {
    const validatedData = leadSchema.parse(req.body);

    const newLead: Lead = {
      id: nextId++,
      ...validatedData,
      created_at: new Date().toISOString(),
      status: "new",
    };

    leads.push(newLead);

    const response: LeadSubmissionResponse = {
      success: true,
      message: "Lead cadastrado com sucesso!",
      lead: newLead,
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
};

// GET /api/leads - Get all leads (for admin)
export const getLeads: RequestHandler = (req, res) => {
  try {
    const { page = "1", limit = "10", status } = req.query;

    let filteredLeads = leads;

    // Filter by status if provided
    if (status && typeof status === "string") {
      filteredLeads = leads.filter((lead) => lead.status === status);
    }

    // Sort by creation date (newest first)
    filteredLeads.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    );

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    const response: LeadsResponse = {
      leads: paginatedLeads,
      total: filteredLeads.length,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar leads",
    });
  }
};

// PUT /api/leads/:id - Update lead status
export const updateLeadStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leadIndex = leads.findIndex((lead) => lead.id === parseInt(id));

    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lead não encontrado",
      });
    }

    const validStatuses = ["new", "contacted", "qualified", "converted"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status inválido",
      });
    }

    leads[leadIndex].status = status;

    res.json({
      success: true,
      message: "Status atualizado com sucesso",
      lead: leads[leadIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar lead",
    });
  }
};

// DELETE /api/leads/:id - Delete a lead
export const deleteLead: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const leadIndex = leads.findIndex((lead) => lead.id === parseInt(id));

    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lead não encontrado",
      });
    }

    leads.splice(leadIndex, 1);

    res.json({
      success: true,
      message: "Lead removido com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao remover lead",
    });
  }
};
