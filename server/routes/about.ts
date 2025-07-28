import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const router = Router();

const ABOUT_FILE_PATH = path.join(process.cwd(), "server/data/about.json");

// Garantir que o diretório existe
async function ensureDataDirectory() {
  const dataDir = path.dirname(ABOUT_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Buscar configurações da seção About
router.get("/", async (req, res) => {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(ABOUT_FILE_PATH, "utf-8");
      const aboutSettings = JSON.parse(data);
      res.json(aboutSettings);
    } catch (error) {
      // Se o arquivo não existir, retorna configuração padrão
      const defaultSettings = {
        section_tag: "Nossa História",
        section_title: "SOBRE A {ecko}ECKO{/ecko}",
        section_subtitle: "mais de 20 anos de streetwear",
        section_description: "Conheça a trajetória de uma das marcas mais influentes do streetwear mundial",
        content: "Fundada em 1993 por Marc Milecofsky, a {ecko}Ecko{/ecko} nasceu com o propósito de dar voz à cultura urbana e ao streetwear autêntico. Começando como uma pequena marca de camisetas em Nova Jersey, rapidamente se tornou um ícone global, sendo reconhecida por suas estampas ousadas e pela conexão genuína com a cultura hip-hop, skate e street art.\\n\\nA marca ganhou destaque ao vestir grandes nomes do rap, como 50 Cent, Eminem e Jay-Z, consolidando sua presença na música e na moda urbana. No Brasil, a {ecko}Ecko{/ecko} chegou na década de 2000 e rapidamente conquistou o público jovem, tornando-se sinônimo de atitude e estilo autêntico.\\n\\nHoje, a {ecko}Ecko{/ecko} continua sendo uma referência no streetwear, mantendo seu DNA rebelde e inovador, sempre conectada com as últimas tendências da cultura urbana. Com mais de duas décadas de história, a marca segue evoluindo e inspirando novas gerações de jovens que buscam autenticidade e qualidade em suas escolhas de moda.",
        stats: [
          {
            id: 1,
            number: "30+",
            label: "Anos de História",
            description: "Mais de três décadas construindo a cultura streetwear"
          },
          {
            id: 2,
            number: "50+",
            label: "Países",
            description: "Presença global com produtos em todos os continentes"
          },
          {
            id: 3,
            number: "1000+",
            label: "Lojas Parceiras",
            description: "Rede de revendedores oficiais no Brasil"
          },
          {
            id: 4,
            number: "100M+",
            label: "Produtos Vendidos",
            description: "Milhões de peças que marcaram gerações"
          }
        ],
        cta_title: "Faça Parte Desta {ecko}História{/ecko}",
        cta_description: "Torne-se um revendedor oficial e ajude a escrever o próximo capítulo da Ecko",
        cta_button_text: "QUERO SER PARTE DA {ecko}ECKO{/ecko}",
        background_type: "color",
        background_color: "#ffffff",
        background_image: "",
        overlay_enabled: false,
        overlay_color: "#000000",
        overlay_opacity: 50,
        overlay_blend_mode: "normal",
        overlay_gradient_enabled: false,
        overlay_gradient_start: "#000000",
        overlay_gradient_end: "#333333",
        overlay_gradient_direction: "to bottom"
      };
      
      res.json(defaultSettings);
    }
  } catch (error) {
    console.error("Erro ao buscar configurações About:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Salvar configurações da seção About
router.post("/", async (req, res) => {
  try {
    await ensureDataDirectory();
    
    const aboutSettings = req.body;
    
    // Validação básica
    if (!aboutSettings || typeof aboutSettings !== "object") {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // Salvar no arquivo específico da seção About
    await fs.writeFile(ABOUT_FILE_PATH, JSON.stringify(aboutSettings, null, 2), "utf-8");

    // Também atualizar no content.json principal para compatibilidade
    try {
      const contentPath = path.join(process.cwd(), "client/data/content.json");
      const contentData = await fs.readFile(contentPath, "utf-8");
      const content = JSON.parse(contentData);
      
      content.about = aboutSettings;
      
      await fs.writeFile(contentPath, JSON.stringify(content, null, 2), "utf-8");
    } catch (error) {
      console.warn("Aviso: Não foi possível atualizar content.json:", error);
    }

    res.json({ 
      success: true, 
      message: "Configurações About salvas com sucesso",
      data: aboutSettings
    });
  } catch (error) {
    console.error("Erro ao salvar configurações About:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
