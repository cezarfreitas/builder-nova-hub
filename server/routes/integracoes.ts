import { Request, Response } from "express";
import { getDatabase } from "../config/database";
import * as crypto from "crypto";

// Função para buscar configuração específica do MySQL
async function getSettingValue(key: string): Promise<string | null> {
  try {
    const db = getDatabase();
    const [rows] = await db.execute(
      `SELECT setting_value FROM lp_settings WHERE setting_key = ?`,
      [key]
    );
    const results = rows as any[];
    return results.length > 0 ? results[0].setting_value : null;
  } catch (error) {
    console.error(`Erro ao buscar configuração ${key}:`, error);
    return null;
  }
}

// Função para enviar evento para Google Analytics 4
export async function sendGA4Event(leadData: any) {
  try {
    const measurementId = await getSettingValue("ga4_measurement_id");
    const apiSecret = await getSettingValue("ga4_api_secret");
    const eventName = await getSettingValue("ga4_conversion_name") || "form_submit";

    if (!measurementId || !apiSecret) {
      console.log("GA4 não configurado - pulando envio");
      return { success: true, skipped: true };
    }

    const clientId = generateClientId();
    const payload = {
      client_id: clientId,
      events: [
        {
          name: eventName,
          params: {
            event_category: "Lead",
            event_label: "Form Submission",
            value: 1,
            custom_parameter_1: leadData.nome || "",
            custom_parameter_2: leadData.telefone || "",
            custom_parameter_3: leadData.tem_cnpj || "",
            custom_parameter_4: leadData.tipo_loja || "",
          },
        },
      ],
    };

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (response.ok) {
      console.log("✅ Evento GA4 enviado com sucesso");
      return { success: true, status: response.status };
    } else {
      console.error(
        "❌ Erro ao enviar evento GA4:",
        response.status,
        response.statusText,
      );
      return { success: false, error: `GA4 Error: ${response.status}` };
    }
  } catch (error) {
    console.error("❌ Erro ao enviar evento GA4:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Função para enviar evento para Meta Pixel (Conversions API)
export async function sendMetaPixelEvent(leadData: any) {
  try {
    const settings = await readSettingsFromFile();
    const pixelId = settings.meta_pixel_id?.value;
    const accessToken = settings.meta_access_token?.value;
    const eventName = settings.meta_conversion_name?.value || "Lead";

    if (!pixelId || !accessToken) {
      console.log("Meta Pixel não configurado - pulando envio");
      return { success: true, skipped: true };
    }

    const eventTime = Math.floor(Date.now() / 1000);
    const testCode = settings.meta_test_code?.value;

    // Preparar dados do usuário com hash SHA256
    const phone = leadData.telefone ? leadData.telefone.replace(/\D/g, "") : "";
    const firstName = (leadData.nome || "").split(" ")[0] || "";
    const lastName = (leadData.nome || "").split(" ").slice(1).join(" ") || "";

    const phoneHash = hashData(phone);
    const firstNameHash = hashData(firstName);
    const lastNameHash = hashData(lastName);

    console.log("📱 Dados para hash:", { phone, firstName, lastName });
    console.log("🔐 Hashes gerados:", {
      phoneHash,
      firstNameHash,
      lastNameHash,
    });

    const userData: any = {};
    if (phoneHash) userData.ph = phoneHash;
    if (firstNameHash) userData.fn = firstNameHash;
    if (lastNameHash) userData.ln = lastNameHash;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          action_source: "website",
          user_data: userData,
          custom_data: {
            value: 1.0,
            currency: "BRL",
            content_type: "lead",
            content_category: "revendedor",
            custom_tem_cnpj: leadData.tem_cnpj || "",
            custom_tipo_loja: leadData.tipo_loja || "",
          },
        },
      ],
    };

    // Adicionar test_event_code se configurado
    if (testCode) {
      payload.test_event_code = testCode;
      console.log("🧪 Usando Test Event Code:", testCode);
    }

    console.log(
      "📤 Enviando payload para Meta Pixel:",
      JSON.stringify(payload, null, 2),
    );

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();
    console.log("📥 Resposta do Meta Pixel:", JSON.stringify(result, null, 2));

    if (response.ok && result.events_received >= 0) {
      console.log("✅ Evento Meta Pixel enviado com sucesso:", result);
      return {
        success: true,
        eventsReceived: result.events_received,
        details: result,
      };
    } else {
      console.error("❌ Erro ao enviar evento Meta Pixel:", result);
      return {
        success: false,
        error: result.error?.message || "Erro desconhecido",
        errorCode: result.error?.code,
        errorSubcode: result.error?.error_subcode,
        details: result,
      };
    }
  } catch (error) {
    console.error("❌ Erro ao enviar evento Meta Pixel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Função para processar todas as integrações quando um lead é capturado
export async function processLeadIntegrations(req: Request, res: Response) {
  try {
    const leadData = req.body;
    console.log("🔄 Processando integrações para lead:", leadData.nome);

    const results = {
      ga4: { success: false, skipped: false },
      metaPixel: { success: false, skipped: false },
      customEvent: { success: false, skipped: false },
    };

    // Enviar para GA4
    const ga4Result = await sendGA4Event(leadData);
    results.ga4 = ga4Result;

    // Enviar para Meta Pixel
    const metaResult = await sendMetaPixelEvent(leadData);
    results.metaPixel = metaResult;

    // Verificar se evento personalizado está ativado
    const settings = await readSettingsFromFile();
    const customEnabled = settings.custom_conversion_enabled?.value === "true";

    if (customEnabled) {
      results.customEvent = { success: true, skipped: false };
      console.log("✅ Evento personalizado será disparado no frontend");
    } else {
      results.customEvent = { success: true, skipped: true };
    }

    res.json({
      success: true,
      message: "Integrações processadas",
      results,
    });
  } catch (error) {
    console.error("❌ Erro ao processar integrações:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar integrações",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// Função para testar apenas o Meta Pixel
export async function testMetaPixelOnly(req: Request, res: Response) {
  try {
    console.log("🧪 Testando apenas Meta Pixel...");

    const testLeadData = {
      nome: "João Silva",
      telefone: "11999999999", // Telefone limpo para facilitar hash
      tem_cnpj: "sim",
      tipo_loja: "fisica",
    };

    console.log("📋 Dados de teste:", testLeadData);

    const result = await sendMetaPixelEvent(testLeadData);

    res.json({
      success: true,
      message: "Teste do Meta Pixel concluído",
      result,
    });
  } catch (error) {
    console.error("❌ Erro ao testar Meta Pixel:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao testar Meta Pixel",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// Função para testar as integrações
export async function testIntegrations(req: Request, res: Response) {
  try {
    const testLeadData = {
      nome: "Teste Integração",
      telefone: "(11) 99999-9999",
      tem_cnpj: "sim",
      tipo_loja: "fisica",
    };

    console.log("🧪 Testando integrações...");

    const results = {
      ga4: await sendGA4Event(testLeadData),
      metaPixel: await sendMetaPixelEvent(testLeadData),
    };

    const settings = await readSettingsFromFile();
    const customEnabled = settings.custom_conversion_enabled?.value === "true";

    res.json({
      success: true,
      message: "Teste de integrações concluído",
      results: {
        ...results,
        customEvent: {
          success: true,
          enabled: customEnabled,
          eventName: settings.custom_conversion_event?.value || "lead_captured",
        },
      },
    });
  } catch (error) {
    console.error("❌ Erro ao testar integrações:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao testar integrações",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// Utilitários
function generateClientId(): string {
  return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
}

function hashData(data: string): string {
  if (!data) return "";

  try {
    // Normalizar dados antes do hash
    let normalizedData = data.toLowerCase().trim();

    // Para telefones: remover todos os caracteres não numéricos
    if (/\d/.test(normalizedData)) {
      normalizedData = normalizedData.replace(/\D/g, "");
      // Se for telefone brasileiro, garantir que tenha código do país
      if (normalizedData.length === 11 && normalizedData.startsWith("1")) {
        normalizedData = "55" + normalizedData;
      } else if (normalizedData.length === 10) {
        normalizedData = "55" + normalizedData;
      }
    }

    const hash = crypto
      .createHash("sha256")
      .update(normalizedData)
      .digest("hex");
    console.log(
      `🔐 Hash gerado para "${data}" -> "${normalizedData}" -> ${hash.substring(0, 10)}...`,
    );
    return hash;
  } catch (error) {
    console.warn("⚠️  Erro ao gerar hash SHA256:", error);
    return "";
  }
}
