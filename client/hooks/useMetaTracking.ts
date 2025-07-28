import { useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';

interface TrackingEvent {
  event_name: string;
  event_data?: any;
  user_data?: any;
  custom_data?: any;
}

interface PageViewData {
  page_title: string;
  page_url: string;
  referrer?: string;
}

export const useMetaTracking = () => {
  const { getSetting } = useSettings();
  const [conversionName, setConversionName] = useState('Lead');

  // Buscar nome da conversão das configurações de integração
  useEffect(() => {
    const loadConversionName = async () => {
      try {
        const response = await fetch('/api/integrations-settings');
        const result = await response.json();
        if (result.success && result.data.meta_conversion_name) {
          setConversionName(result.data.meta_conversion_name);
        }
      } catch (error) {
        console.error('Erro ao carregar nome da conversão:', error);
        // Fallback para o sistema antigo
        const name = getSetting('meta_conversion_name');
        if (name) setConversionName(name);
      }
    };

    loadConversionName();
  }, [getSetting]);

  // Função para enviar eventos para o backend
  const sendEvent = useCallback(async (eventData: TrackingEvent) => {
    try {
      const response = await fetch('/api/meta/track-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        console.warn('Erro ao enviar evento Meta:', response.statusText);
      }
    } catch (error) {
      console.warn('Erro ao enviar evento Meta:', error);
    }
  }, []);

  // Track Page View
  const trackPageView = useCallback((data: PageViewData) => {
    sendEvent({
      event_name: 'PageView',
      custom_data: {
        page_title: data.page_title,
        page_url: data.page_url,
        referrer: data.referrer || document.referrer,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
      },
    });
  }, [sendEvent]);

  // Track Form View (quando o formulário aparece)
  const trackFormView = useCallback(() => {
    sendEvent({
      event_name: 'ViewContent',
      custom_data: {
        content_type: 'form',
        content_category: 'lead_form',
        content_name: 'revenda_form',
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Form Start (primeiro campo preenchido)
  const trackFormStart = useCallback(() => {
    sendEvent({
      event_name: 'InitiateCheckout',
      custom_data: {
        content_type: 'form',
        content_category: 'lead_form_start',
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Button Click
  const trackButtonClick = useCallback((buttonName: string, section?: string) => {
    sendEvent({
      event_name: conversionName,
      custom_data: {
        content_type: 'button_click',
        content_name: buttonName,
        content_category: section || 'general',
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent, conversionName]);

  // Track Scroll Depth
  const trackScrollDepth = useCallback((percentage: number) => {
    if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
      sendEvent({
        event_name: 'ViewContent',
        custom_data: {
          content_type: 'scroll',
          content_category: 'page_engagement',
          scroll_depth: percentage,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [sendEvent]);

  // Track Video Interaction
  const trackVideoPlay = useCallback((videoId?: string) => {
    sendEvent({
      event_name: 'ViewContent',
      custom_data: {
        content_type: 'video',
        content_category: 'video_play',
        content_name: videoId || 'hero_video',
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Time on Page
  const trackTimeOnPage = useCallback((timeInSeconds: number) => {
    if (timeInSeconds === 30 || timeInSeconds === 60 || timeInSeconds === 120 || timeInSeconds === 300) {
      sendEvent({
        event_name: 'ViewContent',
        custom_data: {
          content_type: 'time_on_page',
          content_category: 'engagement',
          time_spent: timeInSeconds,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [sendEvent]);

  // Track FAQ Interaction
  const trackFAQClick = useCallback((questionId: string, question: string) => {
    sendEvent({
      event_name: 'ViewContent',
      custom_data: {
        content_type: 'faq',
        content_category: 'help_interaction',
        content_name: questionId,
        question_text: question,
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Section View (quando uma seção específica entra na tela)
  const trackSectionView = useCallback((sectionName: string) => {
    sendEvent({
      event_name: 'ViewContent',
      custom_data: {
        content_type: 'section',
        content_category: 'section_view',
        content_name: sectionName,
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Contact Intent (hover em botões de contato, focus em campos)
  const trackContactIntent = useCallback((action: string, element?: string) => {
    sendEvent({
      event_name: conversionName,
      custom_data: {
        content_type: 'contact_intent',
        content_category: action, // 'hover', 'focus', 'click'
        content_name: element || 'contact_element',
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Form Abandonment
  const trackFormAbandonment = useCallback((fieldsCompleted: number, totalFields: number) => {
    sendEvent({
      event_name: 'Lead',
      custom_data: {
        content_type: 'form_abandonment',
        content_category: 'form_exit',
        fields_completed: fieldsCompleted,
        total_fields: totalFields,
        completion_rate: (fieldsCompleted / totalFields) * 100,
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Automatizar Page View no mount
  useEffect(() => {
    const timer = setTimeout(() => {
      trackPageView({
        page_title: document.title,
        page_url: window.location.href,
        referrer: document.referrer,
      });
    }, 1000); // Aguarda 1s para garantir que a página carregou

    return () => clearTimeout(timer);
  }, [trackPageView]);

  return {
    trackPageView,
    trackFormView,
    trackFormStart,
    trackButtonClick,
    trackScrollDepth,
    trackVideoPlay,
    trackTimeOnPage,
    trackFAQClick,
    trackSectionView,
    trackContactIntent,
    trackFormAbandonment,
  };
};

// Hook específico para scroll tracking
export const useScrollTracking = () => {
  const { trackScrollDepth } = useMetaTracking();

  useEffect(() => {
    let isTracking = true;
    const tracked = new Set<number>();

    const handleScroll = () => {
      if (!isTracking) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercentage === 25 && !tracked.has(25)) {
        tracked.add(25);
        trackScrollDepth(25);
      } else if (scrollPercentage === 50 && !tracked.has(50)) {
        tracked.add(50);
        trackScrollDepth(50);
      } else if (scrollPercentage === 75 && !tracked.has(75)) {
        tracked.add(75);
        trackScrollDepth(75);
      } else if (scrollPercentage >= 100 && !tracked.has(100)) {
        tracked.add(100);
        trackScrollDepth(100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      isTracking = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trackScrollDepth]);
};

// Hook para time tracking
export const useTimeTracking = () => {
  const { trackTimeOnPage } = useMetaTracking();

  useEffect(() => {
    const startTime = Date.now();
    const tracked = new Set<number>();

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      if (timeSpent === 30 && !tracked.has(30)) {
        tracked.add(30);
        trackTimeOnPage(30);
      } else if (timeSpent === 60 && !tracked.has(60)) {
        tracked.add(60);
        trackTimeOnPage(60);
      } else if (timeSpent === 120 && !tracked.has(120)) {
        tracked.add(120);
        trackTimeOnPage(120);
      } else if (timeSpent === 300 && !tracked.has(300)) {
        tracked.add(300);
        trackTimeOnPage(300);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trackTimeOnPage]);
};
