import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Endpoint para atualizar o arquivo content.json
router.post('/content', async (req, res) => {
  try {
    const newContent = req.body;
    
    // Validar se o conteúdo tem a estrutura básica necessária
    if (!newContent.hero || !newContent.benefits || !newContent.gallery) {
      return res.status(400).json({ 
        success: false, 
        error: 'Estrutura de conteúdo inválida' 
      });
    }

    // Caminho para o arquivo content.json
    const contentPath = path.join(__dirname, '../../client/data/content.json');
    
    // Salvar o conteúdo no arquivo JSON
    await fs.writeFile(contentPath, JSON.stringify(newContent, null, 2), 'utf8');
    
    console.log('Conteúdo salvo no arquivo JSON:', new Date().toISOString());
    
    res.json({ success: true, message: 'Conteúdo salvo com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar conteúdo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;
