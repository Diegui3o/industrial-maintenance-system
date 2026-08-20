import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AppProvider } from './shared/context/AppContext';
import Dashboard from './dashboard/Dashboard';
import EquiposPage from './modules/equipos/pages/EquiposPage';
import EquipoDetailPage from './modules/equipos/pages/EquipoDetailPage';
import EquipoFormPage from './modules/equipos/pages/EquipoFormPage';
import EquipoEditPage from './modules/equipos/pages/EquipoEditPage';
import AlarmasPage from './modules/alarmas/pages/AlarmasPage';
import EventosPage from './modules/eventos/page/EventosPage';
import MetricasPage from './modules/metricas/page/MetricasPage';
import ConfiguracionPage from './modules/configuracion/page/ConfiguracionPage';
import NotificacionesPage from './modules/notifications/page/NotificacionesPage';
import { MinaPanel } from './dashboard/DashboardAreas/Mina/MinaPanel';
import { PlantaPanel } from './dashboard/DashboardAreas/Planta/PlantaPanel';
import { InfraestructuraPanel } from './dashboard/DashboardAreas/Infraestructura/InfraestructuraPanel';

import { useEffect, useState } from 'react';

function DashboardRoute() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/equipos')
      .then(r => setIsConnected(r.ok))
      .catch(() => setIsConnected(false));

    const interval = setInterval(() => {
      fetch('/api/equipos')
        .then(r => setIsConnected(r.ok))
        .catch(() => setIsConnected(false));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return <Dashboard onNavigate={(page) => navigate(`/${page}`)} isConnected={isConnected} />;
}

function EquiposRoute() {
  const navigate = useNavigate();
  return <EquiposPage onNavigate={(page, params) => {
    if (page === 'equipo-detalle') navigate(`/equipos/${params.id}`);
    else if (page === 'crear') navigate('/equipos/nuevo');
    else navigate(`/${page}`);
  }} />;
}

function EquipoDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <EquipoDetailPage
    equipo={{ id: Number(id) }}
    onNavigate={(page, params) => {
      if (page === 'editar-equipo') navigate(`/equipos/${params.id}/editar`);
      else navigate(`/${page}`);
    }}
    onBack={() => navigate('/equipos')}
  />;
}

function EquipoFormRoute() {
  const navigate = useNavigate();
  return <EquipoFormPage onSuccess={() => navigate('/equipos')} onNavigate={(page) => navigate(`/${page}`)} />;
}

function EquipoEditRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <EquipoEditPage equipo={{ id: Number(id) }} onNavigate={(page) => navigate(`/${page}`)} onBack={() => navigate(`/equipos/${id}`)} />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardRoute />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/equipos" element={<EquiposRoute />} />
          <Route path="/equipos/nuevo" element={<EquipoFormRoute />} />
          <Route path="/equipos/:id" element={<EquipoDetailRoute />} />
          <Route path="/equipos/:id/editar" element={<EquipoEditRoute />} />
          <Route path="/alarmas" element={<AlarmasPage onNavigate={() => {}} onBack={() => {}} />} />
          <Route path="/eventos" element={<EventosPage onNavigate={() => {}} onBack={() => {}} />} />
          <Route path="/metricas" element={<MetricasPage onNavigate={() => {}} onBack={() => {}} />} />
          <Route path="/configuracion" element={<ConfiguracionPage onNavigate={() => {}} onBack={() => {}} />} />
          <Route path="/notificaciones" element={<NotificacionesPage onNavigate={() => {}} onBack={() => {}} />} />
          <Route path="/mina" element={<MinaPanel />} />
          <Route path="/planta" element={<PlantaPanel />} />
          <Route path="/infraestructura" element={<InfraestructuraPanel />} />
          <Route path="*" element={<DashboardRoute />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}