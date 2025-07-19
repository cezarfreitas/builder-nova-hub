import { Router } from "express";
import pool from "../database.js";
import { z } from "zod";

const router = Router();

// Schema para validação
const FAQSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória"),
  answer: z.string().min(1, "Resposta é obrigatória"),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

// GET /api/faqs - Obter FAQs com filtros
router.get("/", async (req, res) => {
  try {
    const { active_only, limit = "50", offset = "0" } = req.query;

    let query = "SELECT * FROM faqs";
    const params: any[] = [];

    if (active_only === "true") {
      query += " WHERE is_active = TRUE";
    }

    query += " ORDER BY display_order ASC, created_at ASC";

    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const [rows] = await pool.execute(query, params);
    const allFaqs = rows as any[];

    // Manual pagination since MySQL parameterized LIMIT can cause issues
    const paginatedFaqs = allFaqs.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      faqs: paginatedFaqs,
      total: allFaqs.length,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// GET /api/faqs/:id - Obter FAQ específico
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute("SELECT * FROM faqs WHERE id = ?", [id]);

    const faq = (rows as any[])[0];

    if (!faq) {
      return res.status(404).json({
        error: "FAQ não encontrado",
      });
    }

    res.json({
      success: true,
      faq,
    });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// POST /api/faqs - Criar novo FAQ
router.post("/", async (req, res) => {
  try {
    const validation = FAQSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const data = validation.data;

    const [result] = await pool.execute(
      `INSERT INTO faqs (question, answer, display_order, is_active) 
       VALUES (?, ?, ?, ?)`,
      [data.question, data.answer, data.display_order, data.is_active],
    );

    const insertId = (result as any).insertId;

    // Buscar FAQ criado
    const [newRows] = await pool.execute("SELECT * FROM faqs WHERE id = ?", [
      insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "FAQ criado com sucesso",
      faq: (newRows as any)[0],
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// PUT /api/faqs/:id - Atualizar FAQ
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validation = FAQSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const data = validation.data;

    // Verificar se o FAQ existe
    const [existing] = await pool.execute("SELECT id FROM faqs WHERE id = ?", [
      id,
    ]);

    if ((existing as any[]).length === 0) {
      return res.status(404).json({
        error: "FAQ não encontrado",
      });
    }

    // Atualizar FAQ
    await pool.execute(
      `UPDATE faqs SET 
       question = ?, 
       answer = ?, 
       display_order = ?, 
       is_active = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [data.question, data.answer, data.display_order, data.is_active, id],
    );

    // Buscar FAQ atualizado
    const [updatedRows] = await pool.execute(
      "SELECT * FROM faqs WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "FAQ atualizado com sucesso",
      faq: (updatedRows as any)[0],
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// DELETE /api/faqs/:id - Deletar FAQ
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o FAQ existe
    const [existing] = await pool.execute("SELECT id FROM faqs WHERE id = ?", [
      id,
    ]);

    if ((existing as any[]).length === 0) {
      return res.status(404).json({
        error: "FAQ não encontrado",
      });
    }

    // Deletar FAQ
    await pool.execute("DELETE FROM faqs WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "FAQ deletado com sucesso",
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// PUT /api/faqs/:id/toggle - Alternar status ativo/inativo
router.put("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o FAQ existe
    const [existing] = await pool.execute(
      "SELECT id, is_active FROM faqs WHERE id = ?",
      [id],
    );

    if ((existing as any[]).length === 0) {
      return res.status(404).json({
        error: "FAQ não encontrado",
      });
    }

    const currentStatus = (existing as any)[0].is_active;
    const newStatus = !currentStatus;

    // Atualizar status
    await pool.execute(
      "UPDATE faqs SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newStatus, id],
    );

    // Buscar FAQ atualizado
    const [updatedRows] = await pool.execute(
      "SELECT * FROM faqs WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: `FAQ ${newStatus ? "ativado" : "desativado"} com sucesso`,
      faq: (updatedRows as any)[0],
    });
  } catch (error) {
    console.error("Error toggling FAQ status:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

export default router;
