import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

// Endpoint para testar se o sistema JSON está funcionando
export async function testJsonSystem(req: Request, res: Response) {
  try {
    const settingsFile = path.join(process.cwd(), 'server/data/settings.json');
    
    // Verificar se o arquivo existe
    const fileExists = await fs.access(settingsFile).then(() => true).catch(() => false);
    
    if (!fileExists) {
      return res.json({
        success: false,
        message: 'Arquivo de configurações não encontrado',
        system: 'json'
      });
    }
    
    // Ler o arquivo
    const data = await fs.readFile(settingsFile, 'utf-8');
    const settings = JSON.parse(data);
    
    // Contar configurações
    const settingsCount = Object.keys(settings).length;
    
    // Estatísticas do arquivo
    const stats = await fs.stat(settingsFile);
    
    res.json({
      success: true,
      message: 'Sistema JSON funcionando perfeitamente',
      system: 'json_only',
      data: {
        file_path: settingsFile,
        settings_count: settingsCount,
        file_size: `${(stats.size / 1024).toFixed(2)} KB`,
        last_modified: stats.mtime.toISOString(),
        sample_settings: Object.keys(settings).slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Erro ao testar sistema JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao acessar sistema JSON',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
