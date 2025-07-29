import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { RefreshCw, Database, CheckCircle, AlertCircle } from "lucide-react";

interface HeroDbData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  background_image: string;
  logo_url: string;
  background_color: string;
  text_color: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default function AdminHeroDatabase() {
  const [dbData, setDbData] = useState<HeroDbData | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do banco (via API)
      const heroResponse = await fetch("/api/hero");
      const heroData = await heroResponse.json();
      setJsonData(heroData);

      // Buscar dados diretos do banco
      const dbResponse = await fetch("/api/hero/verify");
      const dbResult = await dbResponse.json();

      if (dbResult.success) {
        setDbData(dbResult.data);
      } else {
        setError("Erro ao buscar dados do banco");
      }
    } catch (err) {
      setError("Erro de conexão");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const testSave = async () => {
    try {
      setTestResult(null);

      const testData = {
        ...jsonData,
        title: `TESTE BANCO ${Date.now()}`,
        subtitle: `Teste realizado em ${new Date().toLocaleString()}`,
      };

      const response = await fetch("/api/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();

      if (result.success) {
        setTestResult("✅ Dados salvos com sucesso no banco de dados!");
        await fetchData(); // Recarregar dados
      } else {
        setTestResult("❌ Erro ao salvar no banco: " + result.error);
      }
    } catch (err) {
      setTestResult("❌ Erro na requisição: " + err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hero - Banco de Dados</h1>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={testSave} variant="default">
            <Database className="w-4 h-4 mr-2" />
            Testar Salvamento
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-blue-700">{testResult}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da API (JSON) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Dados da API (JSON)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jsonData ? (
              <div className="space-y-2">
                <div>
                  <strong>Título:</strong>
                  <p className="text-sm text-gray-600">{jsonData.title}</p>
                </div>
                <div>
                  <strong>Subtítulo:</strong>
                  <p className="text-sm text-gray-600">{jsonData.subtitle}</p>
                </div>
                <div>
                  <strong>Imagem de Fundo:</strong>
                  <p className="text-sm text-gray-600">
                    {jsonData.background_image || "Não definida"}
                  </p>
                </div>
                <div>
                  <strong>Logo:</strong>
                  <p className="text-sm text-gray-600">
                    {jsonData.logo_url || "Não definido"}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Badge variant="secondary">
                    Cor Fundo: {jsonData.background_color}
                  </Badge>
                  <Badge variant="secondary">
                    Cor Texto: {jsonData.text_color}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum dado encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Dados do Banco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-600" />
              Dados do Banco MySQL
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dbData ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <strong>ID:</strong>
                  <Badge variant="outline">{dbData.id}</Badge>
                </div>
                <div>
                  <strong>Título:</strong>
                  <p className="text-sm text-gray-600">{dbData.title}</p>
                </div>
                <div>
                  <strong>Subtítulo:</strong>
                  <p className="text-sm text-gray-600">{dbData.subtitle}</p>
                </div>
                <div>
                  <strong>Criado em:</strong>
                  <p className="text-sm text-gray-600">
                    {new Date(dbData.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <strong>Atualizado em:</strong>
                  <p className="text-sm text-gray-600">
                    {new Date(dbData.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Badge variant={dbData.is_active ? "default" : "secondary"}>
                    {dbData.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum dado encontrado no banco</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparação */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {jsonData ? "✅" : "❌"}
              </div>
              <div className="text-sm text-gray-500">API Funcionando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dbData ? "✅" : "❌"}
              </div>
              <div className="text-sm text-gray-500">Banco Conectado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {jsonData && dbData ? "✅" : "❌"}
              </div>
              <div className="text-sm text-gray-500">Sincronizado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
