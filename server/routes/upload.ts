import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import pool from "../database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// File filter for images only
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Apenas imagens são permitidas (JPEG, PNG, GIF, WebP, SVG)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

interface UploadRecord extends RowDataPacket {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  used_for?: string;
  created_at: string;
}

// POST /api/upload/image - Upload single image
export const uploadImage: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo foi enviado",
      });
    }

    const { alt_text, used_for } = req.body;
    const file = req.file;

    // Create file URL (relative to public directory)
    const fileUrl = `/uploads/${file.filename}`;
    const filePath = file.path;

    // Save file information to database
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO uploaded_files 
       (filename, original_name, file_path, file_url, file_size, mime_type, alt_text, used_for)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.filename,
        file.originalname,
        filePath,
        fileUrl,
        file.size,
        file.mimetype,
        alt_text || null,
        used_for || null,
      ],
    );

    // Get the inserted record
    const [uploadRecord] = await pool.execute<UploadRecord[]>(
      "SELECT * FROM uploaded_files WHERE id = ?",
      [result.insertId],
    );

    res.json({
      success: true,
      message: "Imagem enviada com sucesso",
      upload: uploadRecord[0],
      url: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    // Clean up file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Arquivo muito grande. Máximo 5MB permitido.",
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Erro ao fazer upload da imagem",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

// GET /api/upload/images - Get all uploaded images
export const getUploadedImages: RequestHandler = async (req, res) => {
  try {
    const { used_for, limit = "50", page = "1" } = req.query;
    const limitNum = parseInt(limit as string) || 50;
    const pageNum = parseInt(page as string) || 1;
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT * FROM uploaded_files 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (used_for) {
      query += ` AND used_for = ?`;
      params.push(used_for);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    const [uploads] = await pool.execute<UploadRecord[]>(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM uploaded_files WHERE 1=1";
    const countParams: any[] = [];

    if (used_for) {
      countQuery += " AND used_for = ?";
      countParams.push(used_for);
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(
      countQuery,
      countParams,
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      uploads,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching uploaded images:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar imagens",
    });
  }
};

// DELETE /api/upload/image/:id - Delete uploaded image
export const deleteUploadedImage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Get file information first
    const [uploadRecord] = await pool.execute<UploadRecord[]>(
      "SELECT * FROM uploaded_files WHERE id = ?",
      [id],
    );

    if (uploadRecord.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Imagem não encontrada",
      });
    }

    const upload = uploadRecord[0];

    // Delete file from filesystem
    if (fs.existsSync(upload.file_path)) {
      fs.unlinkSync(upload.file_path);
    }

    // Delete record from database
    await pool.execute("DELETE FROM uploaded_files WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Imagem removida com sucesso",
    });
  } catch (error) {
    console.error("Error deleting uploaded image:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover imagem",
    });
  }
};

// PUT /api/upload/image/:id - Update image metadata
export const updateUploadedImage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, used_for } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE uploaded_files SET alt_text = ?, used_for = ? WHERE id = ?",
      [alt_text || null, used_for || null, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Imagem não encontrada",
      });
    }

    // Get updated record
    const [uploadRecord] = await pool.execute<UploadRecord[]>(
      "SELECT * FROM uploaded_files WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "Informações da imagem atualizadas",
      upload: uploadRecord[0],
    });
  } catch (error) {
    console.error("Error updating uploaded image:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar imagem",
    });
  }
};
