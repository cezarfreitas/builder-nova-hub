import { Router } from "express";
import pool from "../database";
import { z } from "zod";
import {
  GalleryImage,
  GalleryResponse,
  GalleryImageResponse,
  GalleryUpdateResponse,
} from "@shared/api";

const router = Router();

// Validation schemas
const galleryImageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image_url: z.string().url("Invalid image URL"),
  alt_text: z.string().optional(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

const updateGalleryImageSchema = galleryImageSchema.partial();

// GET /api/gallery - Get all gallery images
router.get("/", async (req, res) => {
  try {
    const { active_only, limit = 20, offset = 0 } = req.query;

    let query = "SELECT * FROM gallery";
    let countQuery = "SELECT COUNT(*) as total FROM gallery";

    if (active_only === "true") {
      query += " WHERE is_active = TRUE";
      countQuery += " WHERE is_active = TRUE";
    }

    query += " ORDER BY display_order ASC, created_at DESC";

    // Execute query without LIMIT/OFFSET due to MySQL parameter issues
    const [allImages] = await pool.execute(query);
    const [countResult] = await pool.execute(countQuery);
    const total = (countResult as any)[0].total;

    // Apply pagination in memory
    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;
    const images = (allImages as GalleryImage[]).slice(
      offsetNum,
      offsetNum + limitNum,
    );

    const response: GalleryResponse = {
      success: true,
      images: images,
      total,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({
      success: false,
      images: [],
      total: 0,
      message: "Failed to fetch gallery images",
    });
  }
});

// GET /api/gallery/:id - Get specific gallery image
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute("SELECT * FROM gallery WHERE id = ?", [
      id,
    ]);

    const images = rows as GalleryImage[];

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    const response: GalleryImageResponse = {
      success: true,
      image: images[0],
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gallery image",
    });
  }
});

// POST /api/gallery - Create new gallery image
router.post("/", async (req, res) => {
  try {
    const validatedData = galleryImageSchema.parse(req.body);

    const [result] = await pool.execute(
      `INSERT INTO gallery (title, description, image_url, alt_text, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        validatedData.title,
        validatedData.description || null,
        validatedData.image_url,
        validatedData.alt_text || null,
        validatedData.display_order,
        validatedData.is_active,
      ],
    );

    const insertResult = result as any;
    const newImageId = insertResult.insertId;

    // Fetch the created image
    const [rows] = await pool.execute("SELECT * FROM gallery WHERE id = ?", [
      newImageId,
    ]);

    const newImage = (rows as GalleryImage[])[0];

    const response: GalleryUpdateResponse = {
      success: true,
      message: "Gallery image created successfully",
      image: newImage,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating gallery image:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create gallery image",
    });
  }
});

// PUT /api/gallery/:id - Update gallery image
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateGalleryImageSchema.parse(req.body);

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE gallery SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues,
    );

    // Fetch updated image
    const [rows] = await pool.execute("SELECT * FROM gallery WHERE id = ?", [
      id,
    ]);

    const images = rows as GalleryImage[];

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    const response: GalleryUpdateResponse = {
      success: true,
      message: "Gallery image updated successfully",
      image: images[0],
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating gallery image:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update gallery image",
    });
  }
});

// DELETE /api/gallery/:id - Delete gallery image
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM gallery WHERE id = ?", [
      id,
    ]);

    const deleteResult = result as any;

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    res.json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
    });
  }
});

// POST /api/gallery/:id/toggle - Toggle active status
router.post("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      "UPDATE gallery SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );

    // Fetch updated image
    const [rows] = await pool.execute("SELECT * FROM gallery WHERE id = ?", [
      id,
    ]);

    const images = rows as GalleryImage[];

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    const response: GalleryUpdateResponse = {
      success: true,
      message: "Gallery image status updated successfully",
      image: images[0],
    };

    res.json(response);
  } catch (error) {
    console.error("Error toggling gallery image status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle gallery image status",
    });
  }
});

export default router;
