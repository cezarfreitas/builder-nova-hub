import { useState, useEffect } from "react";

interface FormSettings {
  main_title: string;
  main_description: string;
  title: string;
  subtitle: string;
  fields: {
    name_label: string;
    name_placeholder: string;
    whatsapp_label: string;
    whatsapp_placeholder: string;
    whatsapp_error: string;
    whatsapp_success: string;
    cep_label: string;
    cep_placeholder: string;
    endereco_label: string;
    endereco_placeholder: string;
    complemento_label: string;
    complemento_placeholder: string;
    bairro_label: string;
    cidade_label: string;
    estado_label: string;
    cnpj_label: string;
    cnpj_yes: string;
    cnpj_no: string;
    cnpj_error: string;
    store_type_label: string;
    store_type_placeholder: string;
  };
  submit_button: string;
  submit_button_loading: string;
  validation_messages: {
    whatsapp_invalid: string;
    address_incomplete: string;
    cnpj_required: string;
  };
}

export const useForm = () => {
  const [form, setForm] = useState<FormSettings>({
    main_title: "SEJA PARCEIRO OFICIAL ECKO E TENHA SUCESSO",
    main_description: "Transforme sua paixão pelo streetwear em um negócio lucrativo",
    title: "Cadastro de Revendedor",
    subtitle: "Preencha os dados para receber nossa proposta",
    fields: {
      name_label: "Nome Completo",
      name_placeholder: "Digite seu nome completo",
      whatsapp_label: "WhatsApp",
      whatsapp_placeholder: "(11) 99999-9999",
      whatsapp_error: "Digite um número de WhatsApp válido. Ex: (11) 99999-9999",
      whatsapp_success: "✅ WhatsApp válido",
      cep_label: "CEP",
      cep_placeholder: "Digite seu CEP",
      endereco_label: "Endereço",
      endereco_placeholder: "Rua, número",
      complemento_label: "Complemento",
      complemento_placeholder: "Apto, bloco, casa...",
      bairro_label: "Bairro",
      cidade_label: "Cidade",
      estado_label: "Estado",
      cnpj_label: "Tem CNPJ?",
      cnpj_yes: "Sim",
      cnpj_no: "Não",
      cnpj_error: "Para ser um revendedor oficial da Ecko é necessário ter CNPJ.",
      store_type_label: "Tipo de Loja",
      store_type_placeholder: "Ex: Loja física, Online, Ambos..."
    },
    submit_button: "QUERO SER REVENDEDOR OFICIAL",
    submit_button_loading: "Enviando...",
    validation_messages: {
      whatsapp_invalid: "Digite um número de WhatsApp válido para contato.",
      address_incomplete: "Aguarde o carregamento do endereço ou verifique o CEP.",
      cnpj_required: "É necessário ter CNPJ para se tornar um revendedor autorizado."
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do form
  const loadForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/form", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao carregar dados do form");
      }
      
      const data = await response.json();
      setForm(data);
    } catch (err) {
      console.error("Erro ao carregar form:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Salvar dados do form
  const saveForm = async (formData: FormSettings) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao salvar dados do form");
      }
      
      const result = await response.json();
      setForm(formData);
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error("Erro ao salvar form:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadForm();
  }, []);

  return {
    form,
    loading,
    error,
    saveForm,
    reload: loadForm
  };
};
