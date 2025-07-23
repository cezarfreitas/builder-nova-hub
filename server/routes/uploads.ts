import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `seo-${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use: JPEG, PNG, WebP ou GIF'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// POST /api/uploads/seo-image - Upload de imagem para SEO
export async function uploadSeoImage(req: Request, res: Response) {
  try {
    console.log('Upload request received');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const file = req.file;
    console.log('File received:', {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    });

    // Otimizar imagem com Sharp
    let finalFilename = file.filename;
    let finalSize = file.size;

    try {
      const optimizedFilename = `optimized-${file.filename}`;
      const optimizedPath = path.join(path.dirname(file.path), optimizedFilename);

      // Otimizar e comprimir imagem
      await sharp(file.path)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true
        })
        .toFile(optimizedPath);

      // Verificar se a otimização reduziu o tamanho
      const optimizedStats = fs.statSync(optimizedPath);
      if (optimizedStats.size < file.size) {
        // Usar versão otimizada
        fs.unlinkSync(file.path); // Remover original
        finalFilename = optimizedFilename;
        finalSize = optimizedStats.size;
        console.log('Image optimized:', {
          originalSize: file.size,
          optimizedSize: optimizedStats.size,
          reduction: `${((1 - optimizedStats.size / file.size) * 100).toFixed(1)}%`
        });
      } else {
        // Manter original se não houve melhoria
        fs.unlinkSync(optimizedPath);
        console.log('Original image kept (no size improvement)');
      }
    } catch (error) {
      console.error('Image optimization failed, using original:', error);
    }

    // Usar URL relativa para evitar problemas de CORS/URL
    const imageUrl = `/uploads/${finalFilename}`;

    // Metadados da imagem
    const imageInfo = {
      filename: finalFilename,
      originalName: file.originalname,
      size: finalSize,
      mimetype: file.mimetype,
      url: imageUrl,
      path: file.path
    };

    console.log('Upload successful, returning:', imageInfo);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: imageInfo
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// DELETE /api/uploads/:filename - Deletar imagem
export async function deleteUploadedImage(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }

    // Deletar arquivo
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/uploads - Listar imagens enviadas
export async function listUploadedImages(req: Request, res: Response) {
  try {
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsPath)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(uploadsPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .map(filename => {
        const filePath = path.join(uploadsPath, filename);
        const stats = fs.statSync(filePath);
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        
        return {
          filename,
          url: `${baseUrl}/uploads/${filename}`,
          size: stats.size,
          created_at: stats.birthtime,
          modified_at: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
