export interface DemoResponse {
  message: string;
}

export interface Lead {
  id?: number;
  name: string;
  whatsapp: string;
  hasCnpj: string;
  storeType: string;
  tipo_loja?: string;
  created_at?: string;
  status?: "new" | "contacted" | "qualified" | "converted";
  is_duplicate?: boolean;
  webhook_sent?: boolean;
  webhook_response?: string;
  webhook_sent_at?: string;
}

export interface DailyStats {
  date: string;
  total_leads: number;
  new_leads: number;
  duplicates: number;
  webhook_sent: number;
  webhook_failed: number;
}

export interface DailyStatsResponse {
  stats: DailyStats[];
  summary: {
    total_leads: number;
    today_leads: number;
    duplicates_today: number;
    webhooks_pending: number;
  };
}

export interface Testimonial {
  id?: number;
  name: string;
  company?: string;
  role?: string;
  content: string;
  avatar_url?: string;
  rating: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialsResponse {
  testimonials: Testimonial[];
  total: number;
}

export interface TestimonialSubmissionResponse {
  success: boolean;
  message: string;
  testimonial?: Testimonial;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
}

export interface LeadSubmissionResponse {
  success: boolean;
  message: string;
  lead?: Lead;
}

export interface HeroSettings {
  id?: number;
  logo_url?: string;
  logo_width?: number;
  logo_height?: number;
  main_title: string;
  subtitle?: string;
  description?: string;
  background_image_url?: string;
  background_overlay_opacity?: number;
  background_overlay_color?: string;
  cta_text?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HeroResponse {
  success: boolean;
  hero: HeroSettings;
}

export interface HeroUpdateResponse {
  success: boolean;
  message: string;
  hero: HeroSettings;
}

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQsResponse {
  success: boolean;
  faqs: FAQ[];
  total: number;
}

export interface FAQResponse {
  success: boolean;
  faq: FAQ;
}

export interface FAQUpdateResponse {
  success: boolean;
  message: string;
  faq: FAQ;
}

export interface GalleryImage {
  id?: number;
  title: string;
  description?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryResponse {
  success: boolean;
  images: GalleryImage[];
  total: number;
}

export interface GalleryImageResponse {
  success: boolean;
  image: GalleryImage;
}

export interface GalleryUpdateResponse {
  success: boolean;
  message: string;
  image: GalleryImage;
}

export interface SEOSettings {
  id?: number;
  page_title: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SEOResponse {
  success: boolean;
  seo: SEOSettings;
}

export interface SEOUpdateResponse {
  success: boolean;
  message: string;
  seo: SEOSettings;
}

export interface ThemeSettings {
  id?: number;
  primary_color: string;
  primary_light: string;
  primary_dark: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ThemeResponse {
  success: boolean;
  theme: ThemeSettings;
}

export interface ThemeUpdateResponse {
  success: boolean;
  message: string;
  theme: ThemeSettings;
}

export interface WebhookLog {
  id?: number;
  lead_id: number;
  webhook_url?: string;
  request_payload?: string;
  response_status?: number;
  response_body?: string;
  response_headers?: string;
  attempt_number: number;
  success: boolean;
  error_message?: string;
  sent_at?: string;
}

export interface WebhookLogsResponse {
  success: boolean;
  logs: WebhookLog[];
  total: number;
}
