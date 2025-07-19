import { RequestHandler } from "express";
import { Lead, LeadsResponse, LeadSubmissionResponse } from "@shared/api";
import { z } from "zod";
import pool from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  hasCnpj: z.string().min(1, "Informação sobre CNPJ é obrigatória"),
  storeType: z.string().min(1, "Tipo de loja é obrigatório"),
});

// Interface for MySQL lead rows
interface LeadRow extends RowDataPacket {
  id: number;
  name: string;
  whatsapp: string;
  hasCnpj: string;
  storeType: string;
  status: string;
  created_at: string;
}

// POST /api/leads - Submit a new lead
export const submitLead: RequestHandler = async (req, res) => {
  try {
    const validatedData = leadSchema.parse(req.body);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO leads (name, whatsapp, hasCnpj, storeType, status) 
       VALUES (?, ?, ?, ?, 'new')`,
      [
        validatedData.name,
        validatedData.whatsapp,
        validatedData.hasCnpj,
        validatedData.storeType,
      ],
    );

    // Get the inserted lead
    const [rows] = await pool.execute<LeadRow[]>(
      "SELECT * FROM leads WHERE id = ?",
      [result.insertId],
    );

    const newLead = rows[0];

    const response: LeadSubmissionResponse = {
      success: true,
      message: "Lead cadastrado com sucesso!",
      lead: {
        id: newLead.id,
        name: newLead.name,
        whatsapp: newLead.whatsapp,
        hasCnpj: newLead.hasCnpj,
        storeType: newLead.storeType,
        status: newLead.status as
          | "new"
          | "contacted"
          | "qualified"
          | "converted",
        created_at: newLead.created_at,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error submitting lead:", error);
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
export const getLeads: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10", status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(limit as string) || 10),
    );
    const offset = (pageNum - 1) * limitNum;

    let query = "SELECT * FROM leads ORDER BY created_at DESC";
    let countQuery = "SELECT COUNT(*) as total FROM leads";
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Filter by status if provided
    if (status && typeof status === "string") {
      query = "SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC";
      countQuery = "SELECT COUNT(*) as total FROM leads WHERE status = ?";
      queryParams.push(status);
      countParams.push(status);
    }

    // Execute both queries
    const [leads] = await pool.execute<LeadRow[]>(query, queryParams);
    const [countResult] = await pool.execute<RowDataPacket[]>(
      countQuery,
      countParams,
    );

    const total = countResult[0].total;

    // Apply pagination in memory for now (will optimize later)
    const startIndex = offset;
    const endIndex = startIndex + limitNum;
    const paginatedLeads = leads.slice(startIndex, endIndex);

    // Map database results to Lead interface
    const mappedLeads: Lead[] = paginatedLeads.map((row) => ({
      id: row.id,
      name: row.name,
      whatsapp: row.whatsapp,
      hasCnpj: row.hasCnpj,
      storeType: row.storeType,
      status: row.status as "new" | "contacted" | "qualified" | "converted",
      created_at: row.created_at,
    }));

    const response: LeadsResponse = {
      leads: mappedLeads,
      total: total,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar leads",
    });
  }
};

// PUT /api/leads/:id - Update lead status
export const updateLeadStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["new", "contacted", "qualified", "converted"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status inválido",
      });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE leads SET status = ? WHERE id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead não encontrado",
      });
    }

    // Get updated lead
    const [rows] = await pool.execute<LeadRow[]>(
      "SELECT * FROM leads WHERE id = ?",
      [id],
    );

    const updatedLead = rows[0];

    res.json({
      success: true,
      message: "Status atualizado com sucesso",
      lead: {
        id: updatedLead.id,
        name: updatedLead.name,
        whatsapp: updatedLead.whatsapp,
        hasCnpj: updatedLead.hasCnpj,
        storeType: updatedLead.storeType,
        status: updatedLead.status as
          | "new"
          | "contacted"
          | "qualified"
          | "converted",
        created_at: updatedLead.created_at,
      },
    });
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar lead",
    });
  }
};

// DELETE /api/leads/:id - Delete a lead
export const deleteLead: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM leads WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Lead removido com sucesso",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover lead",
    });
  }
};
