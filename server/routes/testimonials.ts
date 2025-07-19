import { RequestHandler } from "express";
import {
  Testimonial,
  TestimonialsResponse,
  TestimonialSubmissionResponse,
} from "@shared/api";
import { z } from "zod";
import pool from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Validation schema for testimonial submission
const testimonialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  company: z.string().optional(),
  role: z.string().optional(),
  content: z.string().min(1, "Conteúdo do depoimento é obrigatório"),
  avatar_url: z.string().url().optional().or(z.literal("")),
  rating: z.number().min(1).max(5).default(5),
  is_active: z.boolean().default(true),
});

// Interface for MySQL testimonial rows
interface TestimonialRow extends RowDataPacket {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  avatar_url: string;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/testimonials - Get all testimonials (for admin) or active ones (for public)
export const getTestimonials: RequestHandler = async (req, res) => {
  try {
    const { active_only = "false", limit = "20" } = req.query;
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(limit as string) || 20),
    );

    let query = "SELECT * FROM testimonials";
    const queryParams: any[] = [];

    // Filter only active testimonials for public view
    if (active_only === "true") {
      query += " WHERE is_active = TRUE";
    }

    query += " ORDER BY created_at DESC";

    // Execute query without LIMIT for now (apply pagination in memory)
    const [allTestimonials] = await pool.execute<TestimonialRow[]>(
      query,
      queryParams,
    );

    // Apply limit in memory
    const testimonials = allTestimonials.slice(0, limitNum);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM testimonials";
    if (active_only === "true") {
      countQuery += " WHERE is_active = TRUE";
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery);
    const total = countResult[0].total;

    // Map database results to Testimonial interface
    const mappedTestimonials: Testimonial[] = testimonials.map((row) => ({
      id: row.id,
      name: row.name,
      company: row.company,
      role: row.role,
      content: row.content,
      avatar_url: row.avatar_url,
      rating: row.rating,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    const response: TestimonialsResponse = {
      testimonials: mappedTestimonials,
      total: total,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar depoimentos",
    });
  }
};

// POST /api/testimonials - Create a new testimonial
export const createTestimonial: RequestHandler = async (req, res) => {
  try {
    const validatedData = testimonialSchema.parse(req.body);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO testimonials (name, company, role, content, avatar_url, rating, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.name,
        validatedData.company || null,
        validatedData.role || null,
        validatedData.content,
        validatedData.avatar_url || null,
        validatedData.rating,
        validatedData.is_active,
      ],
    );

    // Get the inserted testimonial
    const [rows] = await pool.execute<TestimonialRow[]>(
      "SELECT * FROM testimonials WHERE id = ?",
      [result.insertId],
    );

    const newTestimonial = rows[0];

    const response: TestimonialSubmissionResponse = {
      success: true,
      message: "Depoimento criado com sucesso!",
      testimonial: {
        id: newTestimonial.id,
        name: newTestimonial.name,
        company: newTestimonial.company,
        role: newTestimonial.role,
        content: newTestimonial.content,
        avatar_url: newTestimonial.avatar_url,
        rating: newTestimonial.rating,
        is_active: Boolean(newTestimonial.is_active),
        created_at: newTestimonial.created_at,
        updated_at: newTestimonial.updated_at,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating testimonial:", error);
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

// PUT /api/testimonials/:id - Update a testimonial
export const updateTestimonial: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = testimonialSchema.parse(req.body);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE testimonials 
       SET name = ?, company = ?, role = ?, content = ?, avatar_url = ?, rating = ?, is_active = ?
       WHERE id = ?`,
      [
        validatedData.name,
        validatedData.company || null,
        validatedData.role || null,
        validatedData.content,
        validatedData.avatar_url || null,
        validatedData.rating,
        validatedData.is_active,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Depoimento não encontrado",
      });
    }

    // Get updated testimonial
    const [rows] = await pool.execute<TestimonialRow[]>(
      "SELECT * FROM testimonials WHERE id = ?",
      [id],
    );

    const updatedTestimonial = rows[0];

    res.json({
      success: true,
      message: "Depoimento atualizado com sucesso",
      testimonial: {
        id: updatedTestimonial.id,
        name: updatedTestimonial.name,
        company: updatedTestimonial.company,
        role: updatedTestimonial.role,
        content: updatedTestimonial.content,
        avatar_url: updatedTestimonial.avatar_url,
        rating: updatedTestimonial.rating,
        is_active: Boolean(updatedTestimonial.is_active),
        created_at: updatedTestimonial.created_at,
        updated_at: updatedTestimonial.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar depoimento",
      });
    }
  }
};

// DELETE /api/testimonials/:id - Delete a testimonial
export const deleteTestimonial: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM testimonials WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Depoimento não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Depoimento removido com sucesso",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover depoimento",
    });
  }
};

// GET /api/testimonials/:id - Get single testimonial
export const getTestimonial: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute<TestimonialRow[]>(
      "SELECT * FROM testimonials WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Depoimento não encontrado",
      });
    }

    const testimonial = rows[0];

    res.json({
      success: true,
      testimonial: {
        id: testimonial.id,
        name: testimonial.name,
        company: testimonial.company,
        role: testimonial.role,
        content: testimonial.content,
        avatar_url: testimonial.avatar_url,
        rating: testimonial.rating,
        is_active: Boolean(testimonial.is_active),
        created_at: testimonial.created_at,
        updated_at: testimonial.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar depoimento",
    });
  }
};
