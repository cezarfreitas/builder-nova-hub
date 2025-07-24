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

// Filtro para aceitar apenas imagens com validação de peso
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido. Use: JPEG, PNG, WebP ou GIF'));
  }

  cb(null, true);
};

// Função para formatar tamanho de arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Diferentes configurações de upload por tipo
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  }
});

// Upload específico para avatares (menores)
export const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB para avatares
  }
});

// Upload para hero/background (maiores mas com compressão)
export const uploadHero = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'hero');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `hero-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB para imagens de hero
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
    const originalSizeFormatted = formatFileSize(file.size);

    console.log('File received:', {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      sizeFormatted: originalSizeFormatted,
      mimetype: file.mimetype,
      path: file.path
    });

    // Validação adicional de peso por tipo de uso
    const maxSizes = {
      avatar: 2 * 1024 * 1024,    // 2MB
      hero: 15 * 1024 * 1024,     // 15MB
      gallery: 5 * 1024 * 1024,   // 5MB
      seo: 10 * 1024 * 1024       // 10MB
    };

    const uploadType = req.body.type || 'seo';
    const maxSize = maxSizes[uploadType as keyof typeof maxSizes] || maxSizes.seo;

    if (file.size > maxSize) {
      // Remover arquivo que excede o limite
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return res.status(400).json({
        success: false,
        message: `Arquivo muito grande. Tamanho atual: ${originalSizeFormatted}. Máximo permitido para ${uploadType}: ${formatFileSize(maxSize)}`,
        details: {
          currentSize: file.size,
          currentSizeFormatted: originalSizeFormatted,
          maxSize: maxSize,
          maxSizeFormatted: formatFileSize(maxSize),
          uploadType: uploadType
        }
      });
    }

    // Compactação inteligente baseada no peso da imagem
    let finalFilename = file.filename;
    let finalSize = file.size;
    let finalPath = file.path;
    let compressionInfo = null;

    try {
      // Gerar nome compactado
      const ext = path.extname(file.filename);
      const nameWithoutExt = path.basename(file.filename, ext);
      const compressedFilename = `${nameWithoutExt}-compressed${ext}`;
      const compressedPath = path.join(path.dirname(file.path), compressedFilename);

      // Determinar configurações de compactação baseadas no tamanho
      const isLargeFile = file.size > 2 * 1024 * 1024; // > 2MB
      const isVeryLargeFile = file.size > 5 * 1024 * 1024; // > 5MB

      // Qualidade baseada no tamanho do arquivo
      let quality = 95; // Alta qualidade por padrão
      let maxWidth = 1920;
      let maxHeight = 1920;

      if (isVeryLargeFile) {
        quality = 80; // Compressão maior para arquivos muito grandes
        maxWidth = 1600;
        maxHeight = 1600;
      } else if (isLargeFile) {
        quality = 85; // Compressão moderada
        maxWidth = 1800;
        maxHeight = 1800;
      }

      // Configurações específicas por tipo de upload
      if (uploadType === 'avatar') {
        quality = 90;
        maxWidth = 400;
        maxHeight = 400;
      } else if (uploadType === 'hero') {
        quality = isVeryLargeFile ? 75 : 85;
        maxWidth = 1920;
        maxHeight = 1080;
      }

      const isJpeg = file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg';
      const isPng = file.mimetype === 'image/png';
      const isWebp = file.mimetype === 'image/webp';

      let sharpInstance = sharp(file.path)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });

      if (isJpeg) {
        sharpInstance = sharpInstance.jpeg({
          quality: quality,
          progressive: true,
          mozjpeg: true
        });
      } else if (isPng) {
        sharpInstance = sharpInstance.png({
          quality: Math.min(quality, 90), // PNG qualidade máxima 90
          compressionLevel: isLargeFile ? 9 : 6,
          progressive: true
        });
      } else if (isWebp) {
        sharpInstance = sharpInstance.webp({
          quality: quality,
          progressive: true
        });
      }

      // Salvar imagem compactada
      await sharpInstance.toFile(compressedPath);

      // Verificar se a compactação funcionou
      if (fs.existsSync(compressedPath)) {
        const compressedStats = fs.statSync(compressedPath);
        const reductionPercent = ((1 - compressedStats.size / file.size) * 100);

        // Usar versão compactada se reduziu o tamanho ou se o arquivo original era muito grande
        if (compressedStats.size < file.size || isLargeFile) {
          fs.unlinkSync(file.path); // Remover original
          finalFilename = compressedFilename;
          finalSize = compressedStats.size;
          finalPath = compressedPath;

          compressionInfo = {
            originalSize: file.size,
            originalSizeFormatted: originalSizeFormatted,
            compressedSize: compressedStats.size,
            compressedSizeFormatted: formatFileSize(compressedStats.size),
            reduction: `${reductionPercent.toFixed(1)}%`,
            quality: quality,
            maxDimensions: `${maxWidth}x${maxHeight}`,
            wasCompressed: true
          };

          console.log('Image compressed successfully:', compressionInfo);
        } else {
          // Se a compactação não reduziu o tamanho, manter original
          fs.unlinkSync(compressedPath);
          compressionInfo = {
            originalSize: file.size,
            originalSizeFormatted: originalSizeFormatted,
            wasCompressed: false,
            reason: 'Original file was already compressed'
          };
          console.log('Keeping original file (already compressed)');
        }
      } else {
        console.log('Compression failed, keeping original');
        compressionInfo = {
          originalSize: file.size,
          originalSizeFormatted: originalSizeFormatted,
          wasCompressed: false,
          reason: 'Compression process failed'
        };
      }
    } catch (error) {
      console.error('Image compression failed, using original:', error);
      compressionInfo = {
        originalSize: file.size,
        originalSizeFormatted: originalSizeFormatted,
        wasCompressed: false,
        reason: `Compression error: ${error.message}`
      };
    }

    // Usar URL relativa para evitar problemas de CORS/URL
    // Se está em subpasta (hero, avatars), incluir no path
    const subPath = file.path.includes('hero') ? 'hero/' :
                   file.path.includes('avatars') ? 'avatars/' : '';
    const imageUrl = `/uploads/${subPath}${finalFilename}`;

    // Metadados completos da imagem
    const imageInfo = {
      filename: finalFilename,
      originalName: file.originalname,
      size: finalSize,
      sizeFormatted: formatFileSize(finalSize),
      mimetype: file.mimetype,
      url: imageUrl,
      path: finalPath,
      uploadType: uploadType,
      compression: compressionInfo
    };

    console.log('Upload successful, returning:', imageInfo);

    // Mensagem dinâmica baseada na compactação
    let message = 'Imagem enviada com sucesso';
    if (compressionInfo?.wasCompressed) {
      message += ` e compactada (redução de ${compressionInfo.reduction})`;
    }

    res.json({
      success: true,
      message: message,
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
