import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardPage from './pages/DashboardPage';
import EquiposPage from './pages/EquiposPage';
import EquipoDetailPage from './pages/EquipoDetailPage';
import EquipoFormPage from './pages/EquipoFormPage';
import AlarmasPage from './pages/AlarmasPage';
import EventosPage from './pages/EventosPage';
import MetricasPage from './pages/MetricasPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import { getEquipos } from './services/api';

export default function App() {
  const [screen, setScreen] = useState<string>('dashboard');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const queryClient = useQueryClient();

  // Check de conexión cada 30s
  useEffect(() => {
    const check = () => {
      getEquipos()
        .then(() => setIsConnected(true))
        .catch(() => setIsConnected(false));
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []);

  const navigate = (page: string, params?: any) => {
    setScreen(page);
    setScreenParams(params);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    const childScreens = ['equipos','crear','alarmas','mantenimiento','metricas','configuracion','equipo-detalle'];
    if (childScreens.includes(screen)) {
      navigate('dashboard');
    }
  };

  // Refrescar datos al volver al dashboard
  useEffect(() => {
    if (screen === 'dashboard') {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      queryClient.invalidateQueries({ queryKey: ['alarmas'] });
    }
  }, [screen, queryClient]);

  switch (screen) {
    case 'dashboard':
      return <DashboardPage onNavigate={navigate} isConnected={isConnected} />;
    case 'equipos':
      return <EquiposPage onNavigate={navigate} onBack={goBack} />;
    case 'equipo-detalle':
      return <EquipoDetailPage equipo={screenParams} onNavigate={navigate} onBack={goBack} />;
    case 'crear':
      return <EquipoFormPage onSuccess={() => navigate('equipos')} onNavigate={navigate} onBack={goBack} />;
    case 'alarmas':
      return <AlarmasPage onNavigate={navigate} onBack={goBack} />;
    case 'mantenimiento':
      return <EventosPage onNavigate={navigate} onBack={goBack} />;
    case 'metricas':
      return <MetricasPage onNavigate={navigate} onBack={goBack} />;
    case 'configuracion':
      return <ConfiguracionPage onNavigate={navigate} onBack={goBack} />;
    default:
      return <DashboardPage onNavigate={navigate} isConnected={isConnected} />;
  }
}