import { Request, Response } from "express";
import { z } from "zod";
import { getDatabase } from '../config/database';

// Validation schema para depoimento
const testimonialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  company: z.string().optional(),
  role: z.string().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  avatar_url: z.string().url().optional().or(z.literal("")),
  rating: z.number().min(1).max(5).default(5),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0)
});

// GET /api/testimonials - Listar todos os depoimentos
export async function getTestimonials(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { active_only = 'false' } = req.query;

    let whereClause = '';
    const queryParams: any[] = [];

    if (active_only === 'true') {
      whereClause = 'WHERE is_active = TRUE';
    }

    const [testimonials] = await db.execute(
      `SELECT * FROM testimonials ${whereClause} ORDER BY display_order ASC, created_at DESC`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        testimonials,
        total: (testimonials as any[]).length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar depoimentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/testimonials/:id - Buscar depoimento específico
export async function getTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const [testimonialResult] = await db.execute(
      `SELECT * FROM testimonials WHERE id = ?`,
      [id]
    );

    const testimonials = testimonialResult as any[];
    if (testimonials.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoimento não encontrado'
      });
    }

    res.json({
      success: true,
      data: testimonials[0]
    });
  } catch (error) {
    console.error('Erro ao buscar depoimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// POST /api/testimonials - Criar novo depoimento
export async function createTestimonial(req: Request, res: Response) {
  try {
    const validatedData = testimonialSchema.parse(req.body);
    const db = getDatabase();

    const [result] = await db.execute(
      `INSERT INTO testimonials (name, company, role, content, avatar_url, rating, is_active, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.name,
        validatedData.company || null,
        validatedData.role || null,
        validatedData.content,
        validatedData.avatar_url || null,
        validatedData.rating,
        validatedData.is_active,
        validatedData.display_order
      ]
    );

    const testimonialId = (result as any).insertId;

    // Buscar o depoimento criado
    const [newTestimonial] = await db.execute(
      `SELECT * FROM testimonials WHERE id = ?`,
      [testimonialId]
    );

    res.status(201).json({
      success: true,
      message: 'Depoimento criado com sucesso',
      data: (newTestimonial as any[])[0]
    });
  } catch (error) {
    console.error('Erro ao criar depoimento:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

// PUT /api/testimonials/:id - Atualizar depoimento
export async function updateTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = testimonialSchema.parse(req.body);
    const db = getDatabase();

    // Verificar se o depoimento existe
    const [existingTestimonial] = await db.execute(
      `SELECT id FROM testimonials WHERE id = ?`,
      [id]
    );

    if ((existingTestimonial as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoimento não encontrado'
      });
    }

    // Atualizar depoimento
    await db.execute(
      `UPDATE testimonials SET 
       name = ?, company = ?, role = ?, content = ?, 
       avatar_url = ?, rating = ?, is_active = ?, display_order = ?, 
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        validatedData.name,
        validatedData.company || null,
        validatedData.role || null,
        validatedData.content,
        validatedData.avatar_url || null,
        validatedData.rating,
        validatedData.is_active,
        validatedData.display_order,
        id
      ]
    );

    // Buscar o depoimento atualizado
    const [updatedTestimonial] = await db.execute(
      `SELECT * FROM testimonials WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Depoimento atualizado com sucesso',
      data: (updatedTestimonial as any[])[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar depoimento:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

// DELETE /api/testimonials/:id - Deletar depoimento
export async function deleteTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se o depoimento existe
    const [existingTestimonial] = await db.execute(
      `SELECT id FROM testimonials WHERE id = ?`,
      [id]
    );

    if ((existingTestimonial as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoimento não encontrado'
      });
    }

    // Deletar depoimento
    await db.execute(
      `DELETE FROM testimonials WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Depoimento deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar depoimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/testimonials/:id/toggle - Toggle ativo/inativo
export async function toggleTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se o depoimento existe e buscar status atual
    const [existingTestimonial] = await db.execute(
      `SELECT id, is_active FROM testimonials WHERE id = ?`,
      [id]
    );

    if ((existingTestimonial as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoimento não encontrado'
      });
    }

    const currentStatus = (existingTestimonial as any[])[0].is_active;
    const newStatus = !currentStatus;

    // Atualizar status
    await db.execute(
      `UPDATE testimonials SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStatus, id]
    );

    // Buscar o depoimento atualizado
    const [updatedTestimonial] = await db.execute(
      `SELECT * FROM testimonials WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: `Depoimento ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      data: (updatedTestimonial as any[])[0]
    });
  } catch (error) {
    console.error('Erro ao toggle depoimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/testimonials/reorder - Reordenar depoimentos
export async function reorderTestimonials(req: Request, res: Response) {
  try {
    const { testimonials } = req.body;
    
    if (!Array.isArray(testimonials)) {
      return res.status(400).json({
        success: false,
        message: 'Lista de depoimentos inválida'
      });
    }

    const db = getDatabase();

    // Atualizar a ordem de cada depoimento
    for (let i = 0; i < testimonials.length; i++) {
      const testimonial = testimonials[i];
      await db.execute(
        `UPDATE testimonials SET display_order = ? WHERE id = ?`,
        [i, testimonial.id]
      );
    }

    res.json({
      success: true,
      message: 'Ordem dos depoimentos atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao reordenar depoimentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
