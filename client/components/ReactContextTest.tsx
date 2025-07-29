import React, { createContext, useContext, useState } from 'react';

// Test context to verify createContext is working
interface TestContextType {
  message: string;
  setMessage: (msg: string) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const ReactContextTest: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('React createContext is working!');

  const value = {
    message,
    setMessage
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTestContext must be used within a ReactContextTest provider');
  }
  return context;
};

// Simple test component
export const ContextTestDisplay: React.FC = () => {
  try {
    const { message } = useTestContext();
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'green', 
        color: 'white', 
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        ✅ {message}
      </div>
    );
  } catch (error) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'red', 
        color: 'white', 
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        ❌ createContext Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
};
