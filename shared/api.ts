export interface DemoResponse {
  message: string;
}

export interface Lead {
  id?: number;
  name: string;
  whatsapp: string;
  hasCnpj: string;
  storeType: string;
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
