import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Activity, 
  Eye, 
  Clock, 
  MousePointer, 
  Target, 
  CheckCircle2,
  Info
} from "lucide-react";

export const MetaTrackingInfo = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Meta Facebook Conversions API - Rastreamento Implementado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">✅ Integração Completa Implementada</h3>
          </div>
          <p className="text-green-700 text-sm">
            O sistema de rastreamento Meta Facebook está totalmente configurado e funcional na Landing Page.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-purple-600" />
            Eventos Rastreados Automaticamente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                PageView
              </Badge>
              <span className="text-sm text-gray-600">Visualização da página</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <MousePointer className="w-3 h-3 mr-1" />
                ViewContent
              </Badge>
              <span className="text-sm text-gray-600">Visualização de seções</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Target className="w-3 h-3 mr-1" />
                Lead
              </Badge>
              <span className="text-sm text-gray-600">Intenção de contato</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                InitiateCheckout
              </Badge>
              <span className="text-sm text-gray-600">Início do formulário</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Engagement
              </Badge>
              <span className="text-sm text-gray-600">Tempo na página</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <MousePointer className="w-3 h-3 mr-1" />
                Interactions
              </Badge>
              <span className="text-sm text-gray-600">Cliques e interações</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">🎯 Pontos de Rastreamento na Landing Page</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span><strong>Hero Section:</strong> Visualização inicial, cliques em CTAs</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span><strong>Formulário:</strong> Abertura, início de preenchimento, abandono, envio</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span><strong>Seções:</strong> About, Benefícios, Depoimentos, Galeria, FAQ</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <span><strong>Interações:</strong> FAQ expand, scroll depth, tempo na página</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <span><strong>Contato:</strong> Focus em inputs, hover em botões, cliques em CTAs</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Configuração Recomendada</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Configure o <strong>Pixel ID</strong> e <strong>Access Token</strong> nas configurações</li>
                <li>• Use o <strong>Test Event Code</strong> durante desenvolvimento</li>
                <li>• Ative todas as opções de rastreamento para máxima visibilidade</li>
                <li>• Monitore os eventos no Facebook Events Manager</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">📊 Dados Enviados para o Meta</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• <strong>User Data:</strong> IP, User Agent, Facebook IDs</p>
            <p>• <strong>Event Data:</strong> Tipo de evento, timestamp, URL</p>
            <p>• <strong>Custom Data:</strong> Categoria do conteúdo, ações específicas</p>
            <p>• <strong>Conversion Data:</strong> Valor da conversão, moeda (BRL)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
