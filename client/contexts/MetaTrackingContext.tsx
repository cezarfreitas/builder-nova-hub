import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { robustFetchJson, robustFetch } from '../utils/robustFetch';

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

interface MetaTrackingContextType {
  conversionName: string;
  isLoaded: boolean;
  trackPageView: (data: PageViewData) => void;
  trackFormView: () => void;
  trackFormStart: () => void;
  trackButtonClick: (buttonName: string, section?: string) => void;
  trackScrollDepth: (percentage: number) => void;
  trackVideoPlay: (videoId?: string) => void;
  trackTimeOnPage: (timeInSeconds: number) => void;
  trackFAQClick: (questionId: string, question: string) => void;
  trackSectionView: (sectionName: string) => void;
  trackContactIntent: (action: string, element?: string) => void;
  trackFormAbandonment: (fieldsCompleted: number, totalFields: number) => void;
}

const MetaTrackingContext = createContext<MetaTrackingContextType | undefined>(undefined);

export const MetaTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversionName, setConversionName] = useState("Lead");
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar nome da conversão apenas uma vez
  useEffect(() => {
    if (isLoaded) return;

    const loadConversionName = async () => {
      try {
        console.log("🔄 [META] Carregando nome da conversão...");

        const result = await robustFetchJson("/api/integrations-settings", {
          timeout: 6000,
        });

        if (result.success && result.data.meta_conversion_name) {
          console.log(
            "✅ [META] Nome da conversão carregado:",
            result.data.meta_conversion_name,
          );
          setConversionName(result.data.meta_conversion_name);
        }
      } catch (error) {
        console.error("⚠️ [META] Erro ao carregar nome da conversão:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadConversionName();
  }, []);

  // Função para enviar eventos para o backend
  const sendEvent = useCallback(async (eventData: TrackingEvent) => {
    try {
      const response = await fetch("/api/meta/track-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        console.warn("Erro ao enviar evento Meta:", response.statusText);
      }
    } catch (error) {
      console.warn("Erro ao enviar evento Meta:", error);
    }
  }, []);

  // Track Page View
  const trackPageView = useCallback(
    (data: PageViewData) => {
      sendEvent({
        event_name: "PageView",
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
    },
    [sendEvent],
  );

  // Track Form View (quando o formulário aparece)
  const trackFormView = useCallback(() => {
    sendEvent({
      event_name: "ViewContent",
      custom_data: {
        content_type: "form",
        content_category: "lead_form",
        content_name: "revenda_form",
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Form Start (primeiro campo preenchido)
  const trackFormStart = useCallback(() => {
    sendEvent({
      event_name: "InitiateCheckout",
      custom_data: {
        content_type: "form",
        content_category: "lead_form_start",
        timestamp: new Date().toISOString(),
      },
    });
  }, [sendEvent]);

  // Track Button Click
  const trackButtonClick = useCallback(
    (buttonName: string, section?: string) => {
      sendEvent({
        event_name: conversionName,
        custom_data: {
          content_type: "button_click",
          content_name: buttonName,
          content_category: section || "general",
          timestamp: new Date().toISOString(),
        },
      });
    },
    [sendEvent, conversionName],
  );

  // Track Scroll Depth
  const trackScrollDepth = useCallback(
    (percentage: number) => {
      if (
        percentage === 25 ||
        percentage === 50 ||
        percentage === 75 ||
        percentage === 100
      ) {
        sendEvent({
          event_name: "ViewContent",
          custom_data: {
            content_type: "scroll",
            content_category: "page_engagement",
            scroll_depth: percentage,
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
    [sendEvent],
  );

  // Track Video Interaction
  const trackVideoPlay = useCallback(
    (videoId?: string) => {
      sendEvent({
        event_name: "ViewContent",
        custom_data: {
          content_type: "video",
          content_category: "video_play",
          content_name: videoId || "hero_video",
          timestamp: new Date().toISOString(),
        },
      });
    },
    [sendEvent],
  );

  // Track Time on Page
  const trackTimeOnPage = useCallback(
    (timeInSeconds: number) => {
      if (
        timeInSeconds === 30 ||
        timeInSeconds === 60 ||
        timeInSeconds === 120 ||
        timeInSeconds === 300
      ) {
        sendEvent({
          event_name: "ViewContent",
          custom_data: {
            content_type: "time_on_page",
            content_category: "engagement",
            time_spent: timeInSeconds,
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
    [sendEvent],
  );

  // Track FAQ Interaction
  const trackFAQClick = useCallback(
    (questionId: string, question: string) => {
      sendEvent({
        event_name: "ViewContent",
        custom_data: {
          content_type: "faq",
          content_category: "help_interaction",
          content_name: questionId,
          question_text: question,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [sendEvent],
  );

  // Track Section View (quando uma seção específica entra na tela)
  const trackSectionView = useCallback(
    (sectionName: string) => {
      sendEvent({
        event_name: "ViewContent",
        custom_data: {
          content_type: "section",
          content_category: "section_view",
          content_name: sectionName,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [sendEvent],
  );

  // Track Contact Intent (hover em botões de contato, focus em campos)
  const trackContactIntent = useCallback(
    (action: string, element?: string) => {
      sendEvent({
        event_name: conversionName,
        custom_data: {
          content_type: "contact_intent",
          content_category: action, // 'hover', 'focus', 'click'
          content_name: element || "contact_element",
          timestamp: new Date().toISOString(),
        },
      });
    },
    [sendEvent, conversionName],
  );

  // Track Form Abandonment
  const trackFormAbandonment = useCallback(
    (fieldsCompleted: number, totalFields: number) => {
      sendEvent({
        event_name: conversionName,
        custom_data: {
          content_type: "form_abandonment",
          content_category: "form_exit",
          fields_completed: fieldsCompleted,
          total_fields: totalFields,
          completion_rate: (fieldsCompleted / totalFields) * 100,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [sendEvent, conversionName],
  );

  const value = {
    conversionName,
    isLoaded,
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

  return (
    <MetaTrackingContext.Provider value={value}>
      {children}
    </MetaTrackingContext.Provider>
  );
};

export const useMetaTracking = () => {
  const context = useContext(MetaTrackingContext);
  if (context === undefined) {
    throw new Error('useMetaTracking must be used within a MetaTrackingProvider');
  }
  return context;
};
