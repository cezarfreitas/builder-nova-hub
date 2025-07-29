import fs from "fs";
import path from "path";

// Verificar e restaurar integridade dos dados na inicialização
export function verifyDataIntegrity() {
  console.log("🔍 Verificando integridade dos dados...");

  // Verificar diretório de dados
  const dataDir = path.join(process.cwd(), "server", "data");
  if (!fs.existsSync(dataDir)) {
    console.log("📁 Criando diretório de dados...");
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Verificar hero.json
  const heroPath = path.join(dataDir, "hero.json");
  if (!fs.existsSync(heroPath)) {
    console.log("🔧 Criando arquivo hero.json padrão...");
    const defaultHero = {
      title: "SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL",
      subtitle: "O maior programa de parceria do streetwear",
      description:
        "Transforme sua paixão por streetwear em um negócio lucrativo. Junte-se a milhares de revendedores que já fazem parte da família {ecko}Ecko{/ecko} e descobra como vender produtos autênticos com margens exclusivas.",
      background_image: "",
      background_color: "#000000",
      text_color: "#ffffff",
      cta_primary_text: "QUERO SER {ecko}REVENDEDOR{/ecko}",
      cta_secondary_text: "DESCUBRA COMO",
      cta_color: "#dc2626",
      cta_text_color: "#ffffff",
      overlay_color: "#000000",
      overlay_opacity: 70,
      overlay_blend_mode: "multiply",
      overlay_gradient_enabled: false,
      overlay_gradient_start: "#000000",
      overlay_gradient_end: "#333333",
      overlay_gradient_direction: "to bottom",
      logo_url: "",
    };
    fs.writeFileSync(heroPath, JSON.stringify(defaultHero, null, 2));
  }

  // Verificar settings.json
  const settingsPath = path.join(dataDir, "settings.json");
  if (!fs.existsSync(settingsPath)) {
    console.log("🔧 Criando arquivo settings.json padrão...");
    const defaultSettings = {
      seo_title: {
        value: "Seja uma Revenda Autorizada da Ecko",
        type: "text",
        updated_at: new Date().toISOString(),
      },
      webhook_url: {
        value: "",
        type: "text",
        updated_at: new Date().toISOString(),
      },
    };
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
  }

  // Verificar diretório de uploads
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    console.log("📁 Criando diretório de uploads...");
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Verificar subdiretórios de uploads
  const uploadSubdirs = ["hero", "gallery", "seo"];
  uploadSubdirs.forEach((subdir) => {
    const subdirPath = path.join(uploadsDir, subdir);
    if (!fs.existsSync(subdirPath)) {
      console.log(`📁 Criando diretório uploads/${subdir}...`);
      fs.mkdirSync(subdirPath, { recursive: true });
    }
  });

  console.log("✅ Verificação de integridade concluída");
}

// Verificar se uma imagem existe e está acessível
export function verifyImageExists(imagePath: string): boolean {
  if (!imagePath) return false;

  // Remover a barra inicial se existir
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(process.cwd(), "public", cleanPath);

  return fs.existsSync(fullPath);
}

// Limpar referências de imagens quebradas no hero.json
export function cleanBrokenImageReferences() {
  try {
    const heroPath = path.join(process.cwd(), "server", "data", "hero.json");
    if (!fs.existsSync(heroPath)) return;

    const heroData = JSON.parse(fs.readFileSync(heroPath, "utf8"));
    let hasChanges = false;

    // Verificar background_image
    if (
      heroData.background_image &&
      !verifyImageExists(heroData.background_image)
    ) {
      console.log(
        `⚠️  Imagem de fundo não encontrada: ${heroData.background_image}`,
      );
      heroData.background_image = "";
      hasChanges = true;
    }

    // Verificar logo_url
    if (heroData.logo_url && !verifyImageExists(heroData.logo_url)) {
      console.log(`⚠️  Logo não encontrado: ${heroData.logo_url}`);
      heroData.logo_url = "";
      hasChanges = true;
    }

    // Salvar se houve mudanças
    if (hasChanges) {
      fs.writeFileSync(heroPath, JSON.stringify(heroData, null, 2));
      console.log("🔧 Referências de imagens quebradas removidas do hero.json");
    }
  } catch (error) {
    console.error("❌ Erro ao limpar referências de imagens:", error);
  }
}

// Gerar relatório de status dos dados
export function generateDataStatusReport() {
  const report = {
    timestamp: new Date().toISOString(),
    hero: {
      configExists: false,
      backgroundImageExists: false,
      logoExists: false,
      backgroundImagePath: "",
      logoPath: "",
    },
    uploads: {
      heroDir: false,
      galleryDir: false,
      seoDir: false,
      heroImageCount: 0,
    },
  };

  // Verificar hero.json
  const heroPath = path.join(process.cwd(), "server", "data", "hero.json");
  if (fs.existsSync(heroPath)) {
    report.hero.configExists = true;
    try {
      const heroData = JSON.parse(fs.readFileSync(heroPath, "utf8"));
      report.hero.backgroundImagePath = heroData.background_image || "";
      report.hero.logoPath = heroData.logo_url || "";
      report.hero.backgroundImageExists = verifyImageExists(
        heroData.background_image || "",
      );
      report.hero.logoExists = verifyImageExists(heroData.logo_url || "");
    } catch (error) {
      console.error("❌ Erro ao ler hero.json:", error);
    }
  }

  // Verificar uploads
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  report.uploads.heroDir = fs.existsSync(path.join(uploadsDir, "hero"));
  report.uploads.galleryDir = fs.existsSync(path.join(uploadsDir, "gallery"));
  report.uploads.seoDir = fs.existsSync(path.join(uploadsDir, "seo"));

  if (report.uploads.heroDir) {
    const heroImages = fs.readdirSync(path.join(uploadsDir, "hero"));
    report.uploads.heroImageCount = heroImages.length;
  }

  return report;
}
