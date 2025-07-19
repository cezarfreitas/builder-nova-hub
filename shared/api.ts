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
