import { Request, Response } from 'express';
import { readSettingsFromFile } from './settings';
import * as crypto from 'crypto';

// Função para enviar evento para Google Analytics 4
export async function sendGA4Event(leadData: any) {
  try {
    const settings = await readSettingsFromFile();
    const measurementId = settings.ga4_measurement_id?.value;
    const apiSecret = settings.ga4_api_secret?.value;
    const eventName = settings.ga4_conversion_name?.value || 'form_submit';

    if (!measurementId || !apiSecret) {
      console.log('GA4 não configurado - pulando envio');
      return { success: true, skipped: true };
    }

    const clientId = generateClientId();
    const payload = {
      client_id: clientId,
      events: [{
        name: eventName,
        params: {
          event_category: 'Lead',
          event_label: 'Form Submission',
          value: 1,
          custom_parameter_1: leadData.nome || '',
          custom_parameter_2: leadData.telefone || '',
          custom_parameter_3: leadData.tem_cnpj || '',
          custom_parameter_4: leadData.tipo_loja || ''
        }
      }]
    };

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    if (response.ok) {
      console.log('✅ Evento GA4 enviado com sucesso');
      return { success: true, status: response.status };
    } else {
      console.error('❌ Erro ao enviar evento GA4:', response.status, response.statusText);
      return { success: false, error: `GA4 Error: ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Erro ao enviar evento GA4:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Função para enviar evento para Meta Pixel (Conversions API)
export async function sendMetaPixelEvent(leadData: any) {
  try {
    const settings = await readSettingsFromFile();
    const pixelId = settings.meta_pixel_id?.value;
    const accessToken = settings.meta_access_token?.value;
    const eventName = settings.meta_conversion_name?.value || 'Lead';

    if (!pixelId || !accessToken) {
      console.log('Meta Pixel não configurado - pulando envio');
      return { success: true, skipped: true };
    }

    const eventTime = Math.floor(Date.now() / 1000);
    const testCode = settings.meta_test_code?.value;

    const payload = {
      data: [{
        event_name: eventName,
        event_time: eventTime,
        action_source: 'website',
        user_data: {
          ph: hashData(leadData.telefone || ''), // Phone hash
          fn: hashData((leadData.nome || '').split(' ')[0]), // First name hash
          ln: hashData((leadData.nome || '').split(' ').slice(1).join(' ')) // Last name hash
        },
        custom_data: {
          value: 1.00,
          currency: 'BRL',
          content_type: 'lead',
          content_category: 'revendedor',
          custom_tem_cnpj: leadData.tem_cnpj || '',
          custom_tipo_loja: leadData.tipo_loja || ''
        }
      }]
    };

    // Adicionar test_event_code se configurado
    if (testCode) {
      payload.test_event_code = testCode;
      console.log('🧪 Usando Test Event Code:', testCode);
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (response.ok && result.events_received > 0) {
      console.log('✅ Evento Meta Pixel enviado com sucesso:', result);
      return { success: true, eventsReceived: result.events_received };
    } else {
      console.error('❌ Erro ao enviar evento Meta Pixel:', result);
      return { success: false, error: result.error?.message || 'Erro desconhecido' };
    }
  } catch (error) {
    console.error('❌ Erro ao enviar evento Meta Pixel:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Função para processar todas as integrações quando um lead é capturado
export async function processLeadIntegrations(req: Request, res: Response) {
  try {
    const leadData = req.body;
    console.log('🔄 Processando integrações para lead:', leadData.nome);

    const results = {
      ga4: { success: false, skipped: false },
      metaPixel: { success: false, skipped: false },
      customEvent: { success: false, skipped: false }
    };

    // Enviar para GA4
    const ga4Result = await sendGA4Event(leadData);
    results.ga4 = ga4Result;

    // Enviar para Meta Pixel
    const metaResult = await sendMetaPixelEvent(leadData);
    results.metaPixel = metaResult;

    // Verificar se evento personalizado está ativado
    const settings = await readSettingsFromFile();
    const customEnabled = settings.custom_conversion_enabled?.value === 'true';
    
    if (customEnabled) {
      results.customEvent = { success: true, skipped: false };
      console.log('✅ Evento personalizado será disparado no frontend');
    } else {
      results.customEvent = { success: true, skipped: true };
    }

    res.json({
      success: true,
      message: 'Integrações processadas',
      results
    });

  } catch (error) {
    console.error('❌ Erro ao processar integrações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar integrações',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Função para testar as integrações
export async function testIntegrations(req: Request, res: Response) {
  try {
    const testLeadData = {
      nome: 'Teste Integração',
      telefone: '(11) 99999-9999',
      tem_cnpj: 'sim',
      tipo_loja: 'fisica'
    };

    console.log('🧪 Testando integrações...');

    const results = {
      ga4: await sendGA4Event(testLeadData),
      metaPixel: await sendMetaPixelEvent(testLeadData)
    };

    const settings = await readSettingsFromFile();
    const customEnabled = settings.custom_conversion_enabled?.value === 'true';

    res.json({
      success: true,
      message: 'Teste de integrações concluído',
      results: {
        ...results,
        customEvent: {
          success: true,
          enabled: customEnabled,
          eventName: settings.custom_conversion_event?.value || 'lead_captured'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao testar integrações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar integrações',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Utilitários
function generateClientId(): string {
  return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
}

function hashData(data: string): string {
  if (!data) return '';

  try {
    // Normalizar dados antes do hash
    const normalizedData = data.toLowerCase().trim().replace(/\D/g, '');
    return crypto.createHash('sha256').update(normalizedData).digest('hex');
  } catch (error) {
    console.warn('⚠️  Erro ao gerar hash SHA256:', error);
    return '';
  }
}
