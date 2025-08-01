import { Request, Response } from "express";
import { getDatabase } from "../config/database";

// POST /api/webhook/test - Testar configuração de webhook
export async function testWebhook(req: Request, res: Response) {
  try {
    const { webhook_url, webhook_secret } = req.body;

    if (!webhook_url) {
      return res.status(400).json({
        success: false,
        message: "URL do webhook é obrigatória",
      });
    }

    // Payload de teste completo com todos os campos
    const testPayload = {
      test: true,
      message: "Teste de webhook enviado pelo admin",
      lead_id: 999,
      nome: "João Silva Teste",
      email: "joao.teste@empresa.com",
      telefone: "(11) 99999-9999",
      cidade: "São Paulo",
      empresa: "Empresa Teste ABC Ltda",
      experiencia_revenda: "sim",
      tem_cnpj: "sim", // Manter para compatibilidade
      tipo_loja: "fisica",
      cep: "01234-567",
      endereco: "Rua das Flores, 123",
      numero: "123",
      complemento: "Sala 101",
      bairro: "Centro",
      estado: "SP",
      form_origin: "admin_test",
      is_duplicate: false,
      source: "admin_test",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      ip_address: "127.0.0.1",
      user_agent: "Mozilla/5.0 (Test) Ecko-LP-Webhook-Test/1.0",
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(), // Manter para compatibilidade
    };

    // Preparar headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Ecko-LP-Webhook-Test/1.0",
    };

    // Adicionar assinatura se secret estiver configurado
    if (webhook_secret && webhook_secret.trim() !== "") {
      const crypto = await import("crypto");
      const signature = crypto
        .createHmac("sha256", webhook_secret)
        .update(JSON.stringify(testPayload))
        .digest("hex");
      headers["X-Signature"] = `sha256=${signature}`;
    }

    // Fazer a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    try {
      const response = await fetch(webhook_url, {
        method: "POST",
        headers,
        body: JSON.stringify(testPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      res.json({
        success: true,
        message: "Teste de webhook executado",
        webhook_response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText.substring(0, 1000), // Limitar resposta a 1000 caracteres
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        return res.json({
          success: false,
          message: "Timeout: O webhook não respondeu em 30 segundos",
          error: "TIMEOUT",
        });
      }

      return res.json({
        success: false,
        message: `Erro de conexão: ${fetchError.message}`,
        error: "CONNECTION_ERROR",
      });
    }
  } catch (error) {
    console.error("Erro ao testar webhook:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
