import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, CheckCircle, AlertCircle, Activity } from 'lucide-react';

interface TrackingStatusData {
  timestamp: string;
  database_connected: boolean;
  analytics: {
    recent_events: Array<{
      event_name: string;
      count: number;
      last_event: string;
    }>;
    active_sessions: number;
    total_events_24h: number;
  };
  meta_tracking: {
    total_events_24h: number;
    last_event?: string;
  };
  traffic_sources: Array<{
    source: string;
    medium: string;
    visits: number;
  }>;
  status: string;
}

export const TrackingStatus = () => {
  const [data, setData] = useState<TrackingStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tracking-status');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Erro ao carregar status');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao buscar status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR');
  };

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status do Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2">Carregando status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Erro no Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStatus} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status do Tracking
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(data?.status || 'error')}`}></div>
              <Badge variant={data?.status === 'healthy' ? 'default' : 'destructive'}>
                {data?.status || 'Error'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data?.analytics.active_sessions || 0}
              </div>
              <div className="text-sm text-gray-500">Sessões Ativas (2h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data?.analytics.total_events_24h || 0}
              </div>
              <div className="text-sm text-gray-500">Eventos (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data?.meta_tracking.total_events_24h || 0}
              </div>
              <div className="text-sm text-gray-500">Meta Events (24h)</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Última atualização: {formatTime(lastUpdate.toISOString())}</span>
            <Button 
              onClick={fetchStatus} 
              variant="outline" 
              size="sm" 
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Eventos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.analytics.recent_events.length ? (
            <div className="space-y-2">
              {data.analytics.recent_events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{event.event_name}</div>
                    <div className="text-sm text-gray-500">
                      Último: {formatTime(event.last_event)}
                    </div>
                  </div>
                  <Badge variant="secondary">{event.count} eventos</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum evento recente</p>
          )}
        </CardContent>
      </Card>

      {/* Fontes de Tráfego */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Tráfego (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.traffic_sources.length ? (
            <div className="space-y-2">
              {data.traffic_sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{source.source}</div>
                    <div className="text-sm text-gray-500">{source.medium}</div>
                  </div>
                  <Badge variant="outline">{source.visits} visitas</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma fonte de tráfego recente</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
