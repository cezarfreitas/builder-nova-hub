// Analytics tracking script for session, event and conversion tracking
export interface SessionData {
  id: string;
  userAgent: string;
  ipAddress?: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface EventData {
  sessionId: string;
  eventType: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: string;
  pageUrl: string;
  pageTitle: string;
  elementId?: string;
  elementClass?: string;
  elementText?: string;
}

export interface ConversionData {
  sessionId: string;
  leadId?: number;
  conversionType:
    | "lead_form"
    | "phone_click"
    | "email_click"
    | "social_click"
    | "no_store_indication";
  conversionValue?: string;
  formData?: string;
  pageUrl: string;
}

class Analytics {
  private sessionId: string;
  private sessionStartTime: number;
  private pageViews: number = 0;
  private lastActivity: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.init();
  }

  private generateSessionId(): string {
    return (
      "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
    );
  }

  private async init() {
    if (this.isInitialized || typeof window === "undefined") return;

    try {
      // Start session tracking
      await this.startSession();

      // Track initial page view
      this.trackPageView();

      // Set up event listeners
      this.setupEventListeners();

      // Start heartbeat to track session duration
      this.startHeartbeat();

      this.isInitialized = true;
      console.log("🔍 Analytics initialized for session:", this.sessionId);
    } catch (error) {
      console.error("❌ Analytics initialization failed:", error);
    }
  }

  private async startSession() {
    const sessionData: SessionData = {
      id: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
      utmSource: this.getUrlParam("utm_source"),
      utmMedium: this.getUrlParam("utm_medium"),
      utmCampaign: this.getUrlParam("utm_campaign"),
      utmTerm: this.getUrlParam("utm_term"),
      utmContent: this.getUrlParam("utm_content"),
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      await fetch("/api/analytics/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  }

  private setupEventListeners() {
    // Track clicks on important elements
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Track button clicks
      if (target.tagName === "BUTTON" || target.closest("button")) {
        const button =
          target.tagName === "BUTTON" ? target : target.closest("button")!;
        this.trackEvent({
          eventType: "click",
          eventCategory: "interaction",
          eventAction: "button_click",
          eventLabel: button.textContent?.trim() || "unknown",
          elementId: button.id,
          elementClass: button.className,
          elementText: button.textContent?.trim(),
        });
      }

      // Track link clicks
      if (target.tagName === "A" || target.closest("a")) {
        const link = target.tagName === "A" ? target : target.closest("a")!;
        const href = link.getAttribute("href") || "";

        this.trackEvent({
          eventType: "click",
          eventCategory: "navigation",
          eventAction: "link_click",
          eventLabel: href,
          eventValue: link.textContent?.trim(),
          elementId: link.id,
          elementClass: link.className,
        });

        // Track specific conversion events
        if (href.includes("tel:")) {
          this.trackConversion({
            conversionType: "phone_click",
            conversionValue: href.replace("tel:", ""),
          });
        } else if (href.includes("mailto:")) {
          this.trackConversion({
            conversionType: "email_click",
            conversionValue: href.replace("mailto:", ""),
          });
        } else if (
          href.includes("whatsapp") ||
          href.includes("instagram") ||
          href.includes("facebook")
        ) {
          this.trackConversion({
            conversionType: "social_click",
            conversionValue: href,
          });
        }
      }

      // Track form interactions
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        this.trackEvent({
          eventType: "form_interaction",
          eventCategory: "form",
          eventAction: target.tagName.toLowerCase() + "_focus",
          eventLabel:
            target.getAttribute("name") ||
            target.getAttribute("id") ||
            "unnamed_field",
          elementId: target.id,
          elementClass: target.className,
        });

        // Special tracking for "não tem loja" indication
        if (
          target.tagName === "SELECT" &&
          target.getAttribute("name") === "hasCnpj"
        ) {
          target.addEventListener("change", () => {
            const value = (target as HTMLSelectElement).value;
            if (value === "nao") {
              this.trackConversion({
                conversionType: "no_store_indication",
                conversionValue: "user_indicated_no_cnpj",
              });

              this.trackEvent({
                eventType: "form_selection",
                eventCategory: "conversion_signal",
                eventAction: "no_store_selected",
                eventLabel: "user_has_no_cnpj",
                eventValue: value,
              });
            }
          });
        }
      }
    });

    // Track form submissions
    document.addEventListener("submit", (e) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const formObject: Record<string, string> = {};

      formData.forEach((value, key) => {
        formObject[key] = value.toString();
      });

      this.trackEvent({
        eventType: "form_submit",
        eventCategory: "conversion",
        eventAction: "form_submission",
        eventLabel: form.getAttribute("id") || "unnamed_form",
        eventValue: JSON.stringify(formObject),
        elementId: form.id,
        elementClass: form.className,
      });

      // Track as conversion
      this.trackConversion({
        conversionType: "lead_form",
        formData: JSON.stringify(formObject),
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener("scroll", () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100,
      );

      if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
        maxScrollDepth = scrollDepth;
        this.trackEvent({
          eventType: "scroll",
          eventCategory: "engagement",
          eventAction: "scroll_depth",
          eventLabel: `${scrollDepth}%`,
          eventValue: scrollDepth.toString(),
        });
      }
    });

    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.trackEvent({
          eventType: "page_visibility",
          eventCategory: "engagement",
          eventAction: "page_hidden",
        });
      } else {
        this.trackEvent({
          eventType: "page_visibility",
          eventCategory: "engagement",
          eventAction: "page_visible",
        });
      }
    });

    // Track session end on page unload
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });
  }

  public trackPageView() {
    this.pageViews++;
    this.lastActivity = Date.now();

    this.trackEvent({
      eventType: "page_view",
      eventCategory: "navigation",
      eventAction: "page_load",
      eventLabel: window.location.pathname,
      eventValue: document.title,
    });
  }

  public trackEvent(eventData: Partial<EventData>) {
    const event: EventData = {
      sessionId: this.sessionId,
      eventType: eventData.eventType || "unknown",
      eventCategory: eventData.eventCategory,
      eventAction: eventData.eventAction,
      eventLabel: eventData.eventLabel,
      eventValue: eventData.eventValue,
      pageUrl: window.location.href,
      pageTitle: document.title,
      elementId: eventData.elementId,
      elementClass: eventData.elementClass,
      elementText: eventData.elementText,
    };

    this.lastActivity = Date.now();

    // Send event to server
    fetch("/api/analytics/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.error("Failed to track event:", error);
    });
  }

  public trackConversion(conversionData: Partial<ConversionData>) {
    const conversion: ConversionData = {
      sessionId: this.sessionId,
      leadId: conversionData.leadId,
      conversionType: conversionData.conversionType || "lead_form",
      conversionValue: conversionData.conversionValue,
      formData: conversionData.formData,
      pageUrl: window.location.href,
    };

    this.lastActivity = Date.now();

    // Send conversion to server
    fetch("/api/analytics/conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conversion),
    }).catch((error) => {
      console.error("Failed to track conversion:", error);
    });

    // Also track as event
    this.trackEvent({
      eventType: "conversion",
      eventCategory: "conversion",
      eventAction: conversionData.conversionType,
      eventLabel: conversionData.conversionValue,
      eventValue: conversionData.formData,
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      // Update session duration every 30 seconds
      this.updateSessionDuration();
    }, 30000);
  }

  private updateSessionDuration() {
    const duration = Math.round((Date.now() - this.sessionStartTime) / 1000);
    const bounce = this.pageViews <= 1 && duration < 30;

    fetch("/api/analytics/session/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: this.sessionId,
        duration,
        pageViews: this.pageViews,
        bounce,
        lastActivity: this.lastActivity,
      }),
    }).catch((error) => {
      console.error("Failed to update session:", error);
    });
  }

  private endSession() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    const duration = Math.round((Date.now() - this.sessionStartTime) / 1000);
    const bounce = this.pageViews <= 1 && duration < 30;

    navigator.sendBeacon(
      "/api/analytics/session/end",
      JSON.stringify({
        sessionId: this.sessionId,
        duration,
        pageViews: this.pageViews,
        bounce,
      }),
    );
  }

  // Utility methods
  private getUrlParam(param: string): string | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || undefined;
  }

  private getDeviceType(): "desktop" | "mobile" | "tablet" {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private getOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Unknown";
  }

  // Public methods for manual tracking
  public getSessionId(): string {
    return this.sessionId;
  }

  public trackCustomEvent(eventType: string, data: any) {
    this.trackEvent({
      eventType,
      eventCategory: "custom",
      eventAction: eventType,
      eventValue: JSON.stringify(data),
    });
  }
}

// Create global analytics instance
let analytics: Analytics | null = null;

export function initAnalytics(): Analytics {
  if (!analytics && typeof window !== "undefined") {
    analytics = new Analytics();
  }
  return analytics!;
}

export function getAnalytics(): Analytics | null {
  return analytics;
}

// Auto-initialize when module is loaded in browser
if (typeof window !== "undefined") {
  initAnalytics();
}

export default Analytics;
