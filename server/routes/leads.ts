import { RequestHandler } from "express";
import { z } from "zod";

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  hasCnpj: z.string().min(1, "Informação sobre CNPJ é obrigatória"),
  storeType: z.string().min(1, "Tipo de loja é obrigatório"),
});

// POST /api/leads - Submit a new lead (static landing page version)
export const submitLead: RequestHandler = async (req, res) => {
  try {
    const validatedData = leadSchema.parse(req.body);

    // Log the lead data for demonstration (in production you might send to a webhook)
    console.log("📋 Novo Lead Recebido:", {
      timestamp: new Date().toISOString(),
      name: validatedData.name,
      whatsapp: validatedData.whatsapp,
      hasCnpj: validatedData.hasCnpj,
      storeType: validatedData.storeType,
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return success response
    res.status(201).json({
      success: true,
      message: "Cadastro enviado com sucesso! Nossa equipe entrará em contato em até 24h.",
      lead: {
        id: Math.floor(Math.random() * 1000),
        name: validatedData.name,
        whatsapp: validatedData.whatsapp,
        hasCnpj: validatedData.hasCnpj,
        storeType: validatedData.storeType,
        status: "new",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error submitting lead:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
};
