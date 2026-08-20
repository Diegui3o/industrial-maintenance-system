import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppState {
  screen: string;
  params: any;
}

interface AppContextType {
  current: AppState;
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<AppState[]>([{ screen: 'dashboard', params: null }]);

  const current = history[history.length - 1];

  const navigate = (screen: string, params?: any) => {
    setHistory(prev => [...prev, { screen, params: params || null }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  return (
    <AppContext.Provider value={{ current, navigate, goBack }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}