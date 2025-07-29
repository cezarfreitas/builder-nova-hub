import { Request, Response } from "express";
import { getDatabase } from "../config/database";
import * as crypto from "crypto";

// Função para ler configurações de integrações do MySQL
async function readIntegrationsSettings() {
  try {
    const db = getDatabase();
    const [rows] = await db.execute(
      `SELECT setting_key, setting_value FROM lp_settings
       WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "ga4_measurement_id",
        "ga4_api_secret",
        "ga4_conversion_name",
        "meta_pixel_id",
        "meta_access_token",
        "meta_conversion_name",
        "meta_test_code",
        "meta_tracking_enabled",
        "meta_track_pageview",
        "meta_track_scroll",
        "meta_track_time",
        "meta_track_interactions",
        "custom_conversion_enabled",
        "custom_conversion_event",
        "custom_conversion_value",
      ],
    );

    const results = rows as any[];
    const settings: any = {};

    results.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return settings;
  } catch (error) {
    console.error("Erro ao ler configurações de integrações do MySQL:", error);
    return null;
  }
}

interface MetaTrackingEvent {
  event_name: string;
  event_data?: any;
  user_data?: any;
  custom_data?: any;
}

// Função para enviar evento individual para Meta Conversions API
export async function sendMetaTrackingEvent(eventData: MetaTrackingEvent) {
  try {
    // Ler configurações de integrações do MySQL
    let pixelId, accessToken, testCode;
    const integrationsSettings = await readIntegrationsSettings();

    if (integrationsSettings) {
      pixelId = integrationsSettings.meta_pixel_id;
      accessToken = integrationsSettings.meta_access_token;
      testCode = integrationsSettings.meta_test_code;
    } else {
      console.warn("⚠️ Configurações de integrações não encontradas no MySQL");
      return { success: false, error: "Configurações não encontradas" };
    }

    console.log(`🔍 Verificando credenciais Meta:`);
    console.log(
      `🎯 Pixel ID: ${pixelId ? `${pixelId.substring(0, 8)}...` : "VAZIO"}`,
    );
    console.log(
      `🔑 Access Token: ${accessToken ? `${accessToken.substring(0, 20)}...` : "VAZIO"}`,
    );
    console.log(`🧪 Test Code: ${testCode || "Nenhum"}`);

    if (!pixelId || !accessToken) {
      console.error(
        "❌ Meta Pixel não configurado - Pixel ID ou Access Token vazio",
      );
      return {
        success: false,
        error:
          "Configuração incompleta - Pixel ID ou Access Token não configurado",
        missingConfig: { pixelId: !pixelId, accessToken: !accessToken },
      };
    }

    if (pixelId.trim() === "" || accessToken.trim() === "") {
      console.error("❌ Meta Pixel mal configurado - valores vazios após trim");
      return {
        success: false,
        error: "Configuração inválida - Pixel ID ou Access Token estão vazios",
      };
    }

    const eventTime = Math.floor(Date.now() / 1000);

    // Gerar dados básicos do usuário
    const clientId = generateClientId();
    const userAgent = eventData.custom_data?.user_agent || "";
    const ipAddress = getClientIP();

    const basePayload = {
      data: [
        {
          event_name: eventData.event_name,
          event_time: eventTime,
          action_source: "website",
          event_source_url: eventData.custom_data?.page_url || "",
          user_data: {
            client_ip_address: ipAddress,
            client_user_agent: userAgent,
            fbc: generateFbc(),
            fbp: generateFbp(),
            ...eventData.user_data,
          },
          custom_data: {
            value: eventData.custom_data?.value || 1.0,
            currency: "BRL",
            ...eventData.custom_data,
          },
        },
      ],
    };

    // Adicionar test_event_code se configurado
    if (testCode) {
      basePayload.test_event_code = testCode;
    }

    const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;

    console.log(`📤 Enviando evento ${eventData.event_name} para Meta Pixel:`);
    console.log(`🎯 URL: ${url.substring(0, 80)}...`);
    console.log(`📋 Payload:`, JSON.stringify(basePayload, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(basePayload),
    });

    console.log(
      `📊 Response Status: ${response.status} ${response.statusText}`,
    );

    const result = await response.json();
    console.log(`📄 Response Body:`, JSON.stringify(result, null, 2));

    if (response.ok && result.events_received >= 0) {
      console.log(
        `✅ Evento ${eventData.event_name} enviado com sucesso para a Meta!`,
      );
      console.log(`📈 Eventos recebidos: ${result.events_received}`);
      return {
        success: true,
        eventsReceived: result.events_received,
        details: result,
      };
    } else {
      console.error(`❌ ERRO Meta API - Status: ${response.status}`);
      console.error(`❌ Response completa:`, result);

      let errorMessage = "Erro na API da Meta";
      if (result.error) {
        errorMessage = result.error.message || errorMessage;
        console.error(
          `❌ Erro específico: ${result.error.code} - ${result.error.message}`,
        );
        if (result.error.error_subcode) {
          console.error(`❌ Sub-código: ${result.error.error_subcode}`);
        }
      }

      return {
        success: false,
        error: errorMessage,
        errorCode: result.error?.code,
        errorSubcode: result.error?.error_subcode,
        details: result,
      };
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar evento ${eventData.event_name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Endpoint para receber eventos de tracking do frontend
export async function trackMetaEvent(req: Request, res: Response) {
  try {
    const eventData: MetaTrackingEvent = req.body;

    // Adicionar dados da requisição ao evento
    eventData.custom_data = {
      ...eventData.custom_data,
      page_url: req.headers.referer || "",
      user_agent: req.headers["user-agent"] || "",
      client_ip: getClientIP(req),
    };

    const result = await sendMetaTrackingEvent(eventData);

    res.json({
      success: result.success,
      message: result.success
        ? `Evento ${eventData.event_name} enviado com sucesso para a Meta!`
        : `Falha ao enviar evento ${eventData.event_name} para a Meta`,
      result,
    });
  } catch (error) {
    console.error("❌ Erro ao processar evento de tracking:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar evento de tracking",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// Endpoint para batch de eventos (múltiplos eventos de uma vez)
export async function trackMetaEventsBatch(req: Request, res: Response) {
  try {
    const events: MetaTrackingEvent[] = req.body.events;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nenhum evento fornecido",
      });
    }

    const results = [];

    for (const eventData of events) {
      // Adicionar dados da requisição ao evento
      eventData.custom_data = {
        ...eventData.custom_data,
        page_url: req.headers.referer || "",
        user_agent: req.headers["user-agent"] || "",
        client_ip: getClientIP(req),
      };

      const result = await sendMetaTrackingEvent(eventData);
      results.push(result);
    }

    res.json({
      success: true,
      message: `${events.length} eventos processados`,
      results,
    });
  } catch (error) {
    console.error("❌ Erro ao processar batch de eventos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar batch de eventos",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// Endpoint para teste de evento específico
export async function testMetaTrackingEvent(req: Request, res: Response) {
  try {
    const { event_name = "PageView", custom_data = {} } = req.body;

    console.log(`🧪 Testando evento ${event_name}...`);

    const testEventData: MetaTrackingEvent = {
      event_name,
      custom_data: {
        content_type: "test_event",
        content_category: "testing",
        test_mode: true,
        timestamp: new Date().toISOString(),
        ...custom_data,
      },
    };

    const result = await sendMetaTrackingEvent(testEventData);

    // Retornar o resultado real da Meta API
    res.json({
      success: result.success,
      message: result.success
        ? `Teste do evento ${event_name} enviado com sucesso para a Meta!`
        : `Falha no teste do evento ${event_name}`,
      result,
    });
  } catch (error) {
    console.error("❌ Erro ao testar evento:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao testar evento",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// Endpoint para verificar configuração do Meta Pixel
export async function checkMetaPixelConfig(req: Request, res: Response) {
  try {
    // Ler configurações de integrações do MySQL
    let pixelId, accessToken, testCode, conversionName;
    const integrationsSettings = await readIntegrationsSettings();

    if (integrationsSettings) {
      pixelId = integrationsSettings.meta_pixel_id;
      accessToken = integrationsSettings.meta_access_token;
      testCode = integrationsSettings.meta_test_code;
      conversionName = integrationsSettings.meta_conversion_name;
    } else {
      console.warn("⚠️ Configurações de integrações não encontradas no MySQL");
      return res.status(500).json({
        success: false,
        error: "Configurações não encontradas",
      });
    }

    const config = {
      pixel_id: pixelId ? "Configurado" : "Não configurado",
      access_token: accessToken ? "Configurado" : "Não configurado",
      test_code: testCode || "Nenhum",
      conversion_name: conversionName || "Lead",
    };

    const isConfigured = !!(pixelId && accessToken);

    res.json({
      success: true,
      configured: isConfigured,
      config,
      message: isConfigured
        ? "Meta Pixel está configurado corretamente"
        : "Meta Pixel precisa ser configurado",
    });
  } catch (error) {
    console.error("❌ Erro ao verificar configuração:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar configuração",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// Utilitários
function generateClientId(): string {
  return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
}

function generateFbc(): string {
  // Simular um Facebook Click ID
  return `fb.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
}

function generateFbp(): string {
  // Simular um Facebook Browser ID
  return `fb.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(req?: Request): string {
  if (!req) return "";

  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    (req.headers["x-real-ip"] as string) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    ""
  );
}

function hashData(data: string): string {
  if (!data) return "";

  try {
    const normalizedData = data.toLowerCase().trim();
    const hash = crypto
      .createHash("sha256")
      .update(normalizedData)
      .digest("hex");
    return hash;
  } catch (error) {
    console.warn("⚠️  Erro ao gerar hash SHA256:", error);
    return "";
  }
}
