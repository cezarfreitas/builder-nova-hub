import { Button } from "../components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-black text-ecko-red mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Página não encontrada
          </h2>
          <p className="text-gray-400 text-lg">
            A página que você está procurando não existe.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-ecko-red text-ecko-red hover:bg-ecko-red hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-ecko-red hover:bg-ecko-red-dark text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Home
          </Button>
        </div>
      </div>
    </div>
  );
}
