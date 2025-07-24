import { Request, Response } from "express";
import { z } from "zod";
import { getDatabase } from '../config/database';

// Validation schema para galeria
const gallerySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  image_url: z.string().url("URL da imagem inválida"),
  alt_text: z.string().optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0)
});

// GET /api/gallery - Listar todas as imagens da galeria
export async function getGalleryImages(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { active_only = 'false' } = req.query;

    let whereClause = '';
    const queryParams: any[] = [];

    if (active_only === 'true') {
      whereClause = 'WHERE is_active = TRUE';
    }

    const [images] = await db.execute(
      `SELECT * FROM gallery_images ${whereClause} ORDER BY display_order ASC, created_at DESC`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        images,
        total: (images as any[]).length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar imagens da galeria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/gallery/:id - Buscar imagem específica
export async function getGalleryImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const [imageResult] = await db.execute(
      `SELECT * FROM gallery_images WHERE id = ?`,
      [id]
    );

    const images = imageResult as any[];
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada'
      });
    }

    res.json({
      success: true,
      data: images[0]
    });
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// POST /api/gallery - Criar nova imagem
export async function createGalleryImage(req: Request, res: Response) {
  try {
    const validatedData = gallerySchema.parse(req.body);
    const db = getDatabase();

    const [result] = await db.execute(
      `INSERT INTO gallery_images (title, description, image_url, alt_text, is_active, display_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        validatedData.title,
        validatedData.description || null,
        validatedData.image_url,
        validatedData.alt_text || null,
        validatedData.is_active,
        validatedData.display_order
      ]
    );

    const imageId = (result as any).insertId;

    // Buscar a imagem criada
    const [newImage] = await db.execute(
      `SELECT * FROM gallery_images WHERE id = ?`,
      [imageId]
    );

    res.status(201).json({
      success: true,
      message: 'Imagem adicionada com sucesso',
      data: (newImage as any[])[0]
    });
  } catch (error) {
    console.error('Erro ao criar imagem:', error);
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

// PUT /api/gallery/:id - Atualizar imagem
export async function updateGalleryImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = gallerySchema.parse(req.body);
    const db = getDatabase();

    // Verificar se a imagem existe
    const [existingImage] = await db.execute(
      `SELECT id FROM gallery_images WHERE id = ?`,
      [id]
    );

    if ((existingImage as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada'
      });
    }

    // Atualizar imagem
    await db.execute(
      `UPDATE gallery_images SET 
       title = ?, description = ?, image_url = ?, alt_text = ?, 
       is_active = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        validatedData.title,
        validatedData.description || null,
        validatedData.image_url,
        validatedData.alt_text || null,
        validatedData.is_active,
        validatedData.display_order,
        id
      ]
    );

    // Buscar a imagem atualizada
    const [updatedImage] = await db.execute(
      `SELECT * FROM gallery_images WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Imagem atualizada com sucesso',
      data: (updatedImage as any[])[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error);
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

// DELETE /api/gallery/:id - Deletar imagem
export async function deleteGalleryImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se a imagem existe
    const [existingImage] = await db.execute(
      `SELECT id FROM gallery_images WHERE id = ?`,
      [id]
    );

    if ((existingImage as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada'
      });
    }

    // Deletar imagem
    await db.execute(
      `DELETE FROM gallery_images WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Imagem deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/gallery/:id/toggle - Toggle ativo/inativo
export async function toggleGalleryImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se a imagem existe e buscar status atual
    const [existingImage] = await db.execute(
      `SELECT id, is_active FROM gallery_images WHERE id = ?`,
      [id]
    );

    if ((existingImage as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada'
      });
    }

    const currentStatus = (existingImage as any[])[0].is_active;
    const newStatus = !currentStatus;

    // Atualizar status
    await db.execute(
      `UPDATE gallery_images SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStatus, id]
    );

    // Buscar a imagem atualizada
    const [updatedImage] = await db.execute(
      `SELECT * FROM gallery_images WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: `Imagem ${newStatus ? 'ativada' : 'desativada'} com sucesso`,
      data: (updatedImage as any[])[0]
    });
  } catch (error) {
    console.error('Erro ao toggle imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/gallery/reorder - Reordenar imagens
export async function reorderGalleryImages(req: Request, res: Response) {
  try {
    const { images } = req.body;
    
    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Lista de imagens inválida'
      });
    }

    const db = getDatabase();

    // Atualizar a ordem de cada imagem
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await db.execute(
        `UPDATE gallery_images SET display_order = ? WHERE id = ?`,
        [i, image.id]
      );
    }

    res.json({
      success: true,
      message: 'Ordem das imagens atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao reordenar imagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
