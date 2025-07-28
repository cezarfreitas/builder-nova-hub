import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthProvider = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
            setIsAuthenticated(true);
          } else {
            // Remove dados expirados
            localStorage.removeItem("admin-auth");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem("admin-auth");
      } finally {
        setLoading(false);
      }
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
        setIsAuthenticated(true);
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
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout,
    loading,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};