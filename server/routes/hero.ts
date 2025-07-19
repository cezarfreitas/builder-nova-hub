import { Router } from "express";
import pool from "../database.js";
import { z } from "zod";

const router = Router();

// Schema para validação
const HeroSettingsSchema = z.object({
  logo_url: z.string().optional().nullable(),
  logo_width: z.number().min(50).max(400).optional().default(200),
  logo_height: z.number().min(30).max(200).optional().default(80),
  main_title: z.string().min(1, "Título principal é obrigatório"),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  background_image_url: z.string().optional().nullable(),
  background_overlay_opacity: z.number().min(0).max(100).optional().default(50),
  background_overlay_color: z.string().optional().default("#000000"),
  cta_text: z.string().optional().default("Descubra Como Funciona"),
});

// GET /api/hero - Obter configurações ativas do hero
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM hero_settings WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1",
    );

    const heroSettings = (rows as any)[0];

    if (!heroSettings) {
      // Return default settings if none exist
      const defaultSettings = {
        id: null,
        logo_url: "",
        logo_width: 200,
        logo_height: 80,
        main_title: "TRANSFORME SUA\nPAIXÃO\nEM LUCRO",
        subtitle: "Programa de Revendedores",
        description:
          "Seja um revendedor oficial da marca de streetwear mais desejada do Brasil e multiplique suas vendas!",
        background_image_url: "",
        background_overlay_opacity: 50,
        background_overlay_color: "#000000",
        cta_text: "Descubra Como Funciona",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        hero: defaultSettings,
      });
    }

    res.json({
      success: true,
      hero: heroSettings,
    });
  } catch (error) {
    console.error("Error fetching hero settings:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// POST /api/hero - Criar/Atualizar configurações do hero
router.post("/", async (req, res) => {
  try {
    const validation = HeroSettingsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const data = validation.data;

    // Desativar configurações antigas
    await pool.execute(
      "UPDATE hero_settings SET is_active = FALSE WHERE is_active = TRUE",
    );

    // Inserir novas configurações
    const [result] = await pool.execute(
      `INSERT INTO hero_settings (logo_url, logo_width, logo_height, main_title, subtitle, description, background_image_url, background_overlay_opacity, background_overlay_color, cta_text) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.logo_url || null,
        data.logo_width || 200,
        data.logo_height || 80,
        data.main_title,
        data.subtitle || null,
        data.description || null,
        data.background_image_url || null,
        data.background_overlay_opacity || 50,
        data.background_overlay_color || "#000000",
        data.cta_text || "Descubra Como Funciona",
      ],
    );

    const insertId = (result as any).insertId;

    // Buscar configurações criadas
    const [newRows] = await pool.execute(
      "SELECT * FROM hero_settings WHERE id = ?",
      [insertId],
    );

    res.status(201).json({
      success: true,
      message: "Configurações salvas com sucesso",
      hero: (newRows as any)[0],
    });
  } catch (error) {
    console.error("Error creating hero settings:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// PUT /api/hero/:id - Atualizar configurações específicas do hero
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validation = HeroSettingsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const data = validation.data;

    // Verificar se o registro existe
    const [existing] = await pool.execute(
      "SELECT id FROM hero_settings WHERE id = ?",
      [id],
    );

    if ((existing as any[]).length === 0) {
      return res.status(404).json({
        error: "Configuração não encontrada",
      });
    }

    // Atualizar configurações
    await pool.execute(
      `UPDATE hero_settings SET 
       logo_url = ?, 
       logo_width = ?,
       logo_height = ?,
       main_title = ?, 
       subtitle = ?, 
       description = ?, 
       background_image_url = ?, 
       background_overlay_opacity = ?,
       background_overlay_color = ?,
       cta_text = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.logo_url || null,
        data.logo_width || 200,
        data.logo_height || 80,
        data.main_title,
        data.subtitle || null,
        data.description || null,
        data.background_image_url || null,
        data.background_overlay_opacity || 50,
        data.background_overlay_color || "#000000",
        data.cta_text || "Descubra Como Funciona",
        id,
      ],
    );

    // Buscar configurações atualizadas
    const [updatedRows] = await pool.execute(
      "SELECT * FROM hero_settings WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "Configurações atualizadas com sucesso",
      hero: (updatedRows as any)[0],
    });
  } catch (error) {
    console.error("Error updating hero settings:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// DELETE /api/hero/:id - Deletar configura��ões do hero
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o registro existe
    const [existing] = await pool.execute(
      "SELECT id FROM hero_settings WHERE id = ?",
      [id],
    );

    if ((existing as any[]).length === 0) {
      return res.status(404).json({
        error: "Configuração não encontrada",
      });
    }

    // Deletar configuração
    await pool.execute("DELETE FROM hero_settings WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Configuração deletada com sucesso",
    });
  } catch (error) {
    console.error("Error deleting hero settings:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

export default router;
