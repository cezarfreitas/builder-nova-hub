import { useState, useEffect } from "react";

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
  });

  // Verifica se já existe uma sessão ativa ao carregar a página
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem("admin-auth");
        if (authData) {
          const parsed = JSON.parse(authData);
          const now = new Date().getTime();
          
          // Verifica se o token não expirou (24 horas)
          if (parsed.expires && now < parsed.expires) {
            setAuthState({ isAuthenticated: true, loading: false });
            return;
          } else {
            // Remove dados expirados
            localStorage.removeItem("admin-auth");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem("admin-auth");
      }
      
      setAuthState({ isAuthenticated: false, loading: false });
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Validação simples: admin/admin
      if (username === "admin" && password === "admin") {
        const authData = {
          authenticated: true,
          user: "admin",
          loginTime: new Date().toISOString(),
          expires: new Date().getTime() + (24 * 60 * 60 * 1000), // 24 horas
        };
        
        localStorage.setItem("admin-auth", JSON.stringify(authData));
        setAuthState({ isAuthenticated: true, loading: false });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("admin-auth");
    setAuthState({ isAuthenticated: false, loading: false });
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    login,
    logout,
  };
};
