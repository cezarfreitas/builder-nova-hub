# Integrações de Conversão

Este documento explica como configurar e usar as integrações de conversão disponíveis na plataforma.

## Integrações Disponíveis

### 1. Google Analytics 4 (GA4)
Rastreamento automático de conversões via Measurement Protocol API.

### 2. Meta Pixel (Facebook/Instagram)
Envio de conversões para o Facebook via Conversions API.

### 3. Evento JavaScript Personalizado
Evento customizado disparado no frontend para integrações customizadas.

---

## Configuração

Acesse **Admin > Configurações > Integrações** para configurar as integrações.

### Google Analytics 4

1. **ID de Medição GA4**: Encontre em GA4 → Admin ��� Streams de dados
   - Formato: `G-XXXXXXXXXX`

2. **API Secret**: Crie em GA4 → Admin → Measurement Protocol API secrets
   - Gere uma nova chave secreta

3. **Nome do Evento**: Nome do evento enviado (padrão: `form_submit`)

**Exemplo de configuração:**
```
ID de Medição: G-ABC123XYZ
API Secret: abcd1234efgh5678
Nome do Evento: lead_submission
```

### Meta Pixel

1. **Pixel ID**: Encontre em Events Manager → Data Sources
   - Formato numérico: `123456789012345`

2. **Access Token**: Gere em Events Manager → Settings → Conversions API
   - Formato: `EAAxxxx...`

3. **Nome do Evento**: Tipo de evento Meta (padrão: `Lead`)
   - Opções: `Lead`, `Purchase`, `CompleteRegistration`, etc.

**Exemplo de configuração:**
```
Pixel ID: 123456789012345
Access Token: EAABwz...
Nome do Evento: Lead
```

### Evento Personalizado

1. **Ativar Conversão**: Ativar/Desativar o evento
2. **Nome do Evento**: Nome do evento JavaScript (padrão: `lead_captured`)
3. **Valor da Conversão**: Valor numérico enviado com o evento

**Exemplo de configuração:**
```
Ativar: Sim
Nome do Evento: custom_lead_event
Valor: 1
```

---

## Como Funciona

### Fluxo de Conversão

1. **Lead se cadastra** no formulário da landing page
2. **Dados são salvos** no banco de dados
3. **Webhook é enviado** (se configurado)
4. **Integrações são processadas** automaticamente:
   - GA4: Evento enviado via Measurement Protocol
   - Meta Pixel: Conversão enviada via Conversions API
   - Evento Personalizado: Disparado no frontend

### Dados Enviados

#### Para GA4:
```json
{
  "client_id": "timestamp.random",
  "events": [{
    "name": "form_submit",
    "params": {
      "event_category": "Lead",
      "event_label": "Form Submission",
      "value": 1,
      "custom_parameter_1": "Nome do Lead",
      "custom_parameter_2": "Telefone",
      "custom_parameter_3": "sim/nao (CNPJ)",
      "custom_parameter_4": "fisica/online/ambas"
    }
  }]
}
```

#### Para Meta Pixel:
```json
{
  "data": [{
    "event_name": "Lead",
    "event_time": 1640995200,
    "action_source": "website",
    "user_data": {
      "ph": "hash_telefone",
      "fn": "hash_primeiro_nome",
      "ln": "hash_ultimo_nome"
    },
    "custom_data": {
      "value": 1.00,
      "currency": "BRL",
      "content_type": "lead",
      "content_category": "revendedor"
    }
  }]
}
```

#### Evento Personalizado (Frontend):
```javascript
window.dispatchEvent(new CustomEvent('lead_captured', {
  detail: {
    value: 1,
    timestamp: "2024-01-15T10:30:00.000Z",
    leadData: {
      nome: "João Silva",
      telefone: "(11) 99999-9999",
      tem_cnpj: "sim",
      tipo_loja: "fisica",
      lead_id: 123
    }
  }
}));
```

---

## Teste das Integrações

### Via Interface Admin
1. Acesse **Admin > Configurações > Integrações**
2. Configure as integrações desejadas
3. Clique em **"Testar Integrações"**
4. Verifique os resultados no toast

### Via API
```bash
curl -X POST http://localhost:3000/api/integracoes/test \
  -H "Content-Type: application/json"
```

### Monitoramento
- Logs do servidor mostram o status de cada integração
- Console do navegador mostra eventos personalizados
- GA4 e Meta Pixel têm suas próprias ferramentas de debug

---

## Troubleshooting

### GA4 não está recebendo eventos
1. Verifique se o Measurement ID está correto (formato G-XXXXXXXXXX)
2. Confirme se o API Secret está válido
3. Verifique logs do servidor para erros de rede
4. Use o DebugView do GA4 para monitorar eventos em tempo real

### Meta Pixel com erros
1. Confirme se o Pixel ID está correto (apenas números)
2. Verifique se o Access Token não expirou
3. Certifique-se de que o token tem permissões para Conversions API
4. Use o Event Manager do Facebook para verificar eventos

### Evento Personalizado não dispara
1. Verifique se está ativado nas configurações
2. Abra o Console do navegador e procure por logs
3. Confirme se não há erros JavaScript na página
4. Teste manualmente: `console.log(window)` deve mostrar event listeners

### Logs Úteis
```bash
# Servidor - monitorar integrações
tail -f logs/server.log | grep "integra"

# Navegador - monitorar eventos
console.log('Ouvindo eventos personalizados...');
window.addEventListener('lead_captured', (e) => console.log(e.detail));
```

---

## Segurança

### Dados Sensíveis
- **API Secrets**: Nunca exponha chaves secretas no frontend
- **Access Tokens**: Armazene apenas no servidor
- **Dados Pessoais**: Telefones são hasheados antes do envio ao Meta

### Configurações Recomendadas
- Use HTTPS em produção
- Monitore logs regularmente
- Revise tokens periodicamente
- Mantenha backups das configurações

---

## Exemplos de Uso

### Ouvir Evento Personalizado
```javascript
// Adicionar listener para eventos customizados
window.addEventListener('lead_captured', function(event) {
  console.log('Lead capturado!', event.detail);
  
  // Integrar com outras ferramentas
  if (window.gtag) {
    gtag('event', 'conversion', {
      'send_to': 'AW-123456789/abc123',
      'value': event.detail.value,
      'currency': 'BRL'
    });
  }
  
  // Integrar com Facebook Pixel (frontend)
  if (window.fbq) {
    fbq('track', 'Lead', {
      value: event.detail.value,
      currency: 'BRL'
    });
  }
});
```

### Integração com Google Ads
```javascript
// Configurar conversão do Google Ads
window.addEventListener('lead_captured', function(event) {
  gtag('event', 'conversion', {
    'send_to': 'AW-123456789/AbC-D_efG-h_ijK-l',
    'value': event.detail.value,
    'currency': 'BRL',
    'transaction_id': event.detail.leadData.lead_id
  });
});
```

### Integração com ferramentas de automação
```javascript
// Enviar para Zapier, Make.com, etc.
window.addEventListener('lead_captured', function(event) {
  fetch('https://hooks.zapier.com/hooks/catch/123456/abcdef/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event.detail)
  });
});
```

---

## API Reference

### POST /api/integracoes/process
Processa integrações para um lead específico.

**Body:**
```json
{
  "lead_id": 123,
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "tem_cnpj": "sim",
  "tipo_loja": "fisica"
}
```

### POST /api/integracoes/test
Testa todas as integrações com dados fictícios.

**Response:**
```json
{
  "success": true,
  "results": {
    "ga4": { "success": true, "status": 204 },
    "metaPixel": { "success": true, "eventsReceived": 1 },
    "customEvent": { "success": true, "enabled": true }
  }
}
```
