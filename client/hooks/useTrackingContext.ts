import { createContext, useContext, useEffect, useState } from "react";

interface TrackingContextType {
  isTrackingEnabled: boolean;
  sessionId: string;
  userId: string;
  pageType: 'lp' | 'admin';
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const useTrackingContext = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    // Se não há contexto, determinar automaticamente baseado na URL
    const isAdmin = window.location.pathname.startsWith('/admin');
    const isLoginPage = window.location.pathname === '/admin/login';
    
    // Tracking só é habilitado na LP (não admin, exceto página de login que também não)
    const isTrackingEnabled = !isAdmin;
    
    // Gerar session ID único
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Gerar user ID baseado no IP simulado + timestamp
    const userId = `user_${btoa(navigator.userAgent + Date.now()).slice(0, 20)}`;
    
    return {
      isTrackingEnabled,
      sessionId,
      userId,
      pageType: isAdmin ? 'admin' : 'lp'
    };
  }
  return context;
};

export const useAnalyticsTracking = () => {
  const { isTrackingEnabled, sessionId, userId, pageType } = useTrackingContext();
  const [startTime] = useState(Date.now());

  // Função para rastrear visita na página (apenas na LP)
  const trackPageVisit = async () => {
    if (!isTrackingEnabled || pageType !== 'lp') {
      console.log('📊 Tracking desabilitado - página admin detectada');
      return;
    }

    try {
      console.log('📊 Rastreando visita na LP...');
      
      const response = await fetch("/api/analytics/track-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          page_url: window.location.href,
          referrer: document.referrer,
          utm_source: new URLSearchParams(window.location.search).get("utm_source") || "",
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || "",
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
          user_agent: navigator.userAgent,
          duration_seconds: 0,
          event_type: "page_view",
        }),
      });

      if (response.ok) {
        console.log('✅ Visita rastreada com sucesso');
      } else {
        console.warn('⚠️ Erro ao rastrear visita:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro no tracking:', error);
    }
  };

  // Função para rastrear eventos específicos (apenas na LP)
  const trackEvent = async (eventType: string, eventData: any = {}) => {
    if (!isTrackingEnabled || pageType !== 'lp') {
      console.log(`📊 Event tracking desabilitado para ${eventType} - página admin`);
      return;
    }

    try {
      console.log(`📊 Rastreando evento: ${eventType}`);
      
      const response = await fetch("/api/analytics/track-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          page_url: window.location.href,
          referrer: document.referrer,
          utm_source: new URLSearchParams(window.location.search).get("utm_source") || "",
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || "",
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
          user_agent: navigator.userAgent,
          duration_seconds: Math.floor((Date.now() - startTime) / 1000),
          event_type: eventType,
          ...eventData,
        }),
      });

      if (response.ok) {
        console.log(`✅ Evento ${eventType} rastreado com sucesso`);
      } else {
        console.warn(`⚠️ Erro ao rastrear evento ${eventType}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Erro no tracking do evento ${eventType}:`, error);
    }
  };

  // Rastrear duração da sessão ao sair da página (apenas na LP)
  const trackSessionDuration = async () => {
    if (!isTrackingEnabled || pageType !== 'lp') {
      return;
    }

    try {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      if (navigator.sendBeacon) {
        // Usar sendBeacon para garantir que seja enviado mesmo ao fechar a página
        const data = new FormData();
        data.append('session_id', sessionId);
        data.append('duration_seconds', duration.toString());
        
        navigator.sendBeacon('/api/analytics/track-duration', data);
      } else {
        // Fallback para fetch normal
        await fetch('/api/analytics/track-duration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            duration_seconds: duration,
          }),
        });
      }
      
      console.log(`✅ Duração da sessão rastreada: ${duration}s`);
    } catch (error) {
      console.error('❌ Erro ao rastrear duração:', error);
    }
  };

  // Auto-rastrear visita inicial e duração
  useEffect(() => {
    if (isTrackingEnabled && pageType === 'lp') {
      trackPageVisit();
      
      // Rastrear duração ao sair da página
      const handleBeforeUnload = () => {
        trackSessionDuration();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        trackSessionDuration(); // Também ao desmontar componente
      };
    }
  }, [isTrackingEnabled, pageType]);

  return {
    isTrackingEnabled,
    sessionId,
    userId,
    pageType,
    trackPageVisit,
    trackEvent,
    trackSessionDuration,
  };
};
