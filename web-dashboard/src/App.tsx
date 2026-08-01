import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import DashboardPage from './pages/DashboardPage';
import EquiposPage from './pages/EquiposPage';
import EquipoDetailPage from './pages/EquipoDetailPage';
import EquipoFormPage from './pages/equipos/EquipoFormPage';
import AlarmasPage from './pages/AlarmasPage';
import EventosPage from './pages/EventosPage';
import MetricasPage from './pages/MetricasPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import NotificacionesPage from './pages/notificaciones/NotificacionesPage';
import EquipoEditPage from './pages/EquipoEditPage';

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

function Router() {
  const { current, navigate, goBack } = useApp();
  const { screen, params } = current;
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/equipos')
      .then(r => setIsConnected(r.ok))
      .catch(() => setIsConnected(false));
    const iv = setInterval(() => {
      fetch('/api/equipos')
        .then(r => setIsConnected(r.ok))
        .catch(() => setIsConnected(false));
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const nav = (s: string, p?: any) => navigate(s, p);

  switch (screen) {
    case 'dashboard':     return <DashboardPage onNavigate={nav} isConnected={isConnected} />;
    case 'equipos':       return <EquiposPage onNavigate={nav} />;
    case 'crear':         return <EquipoFormPage onSuccess={() => navigate('equipos')} onNavigate={nav} />;
    case 'equipo-detalle': return <EquipoDetailPage equipo={params} onNavigate={nav} onBack={goBack} />;
    case 'editar-equipo': return <EquipoEditPage equipo={params} onNavigate={nav} onBack={goBack} />;
    case 'alarmas':       return <AlarmasPage onNavigate={nav} onBack={goBack} />;
    case 'mantenimiento': return <EventosPage onNavigate={nav} onBack={goBack} />;
    case 'metricas':      return <MetricasPage onNavigate={nav} onBack={goBack} />;
    case 'configuracion': return <ConfiguracionPage onNavigate={nav} onBack={goBack} />;
    case 'notificaciones': return <NotificacionesPage onNavigate={nav} onBack={goBack} />;
    default:              return <DashboardPage onNavigate={nav} isConnected={isConnected} />;
  }
}