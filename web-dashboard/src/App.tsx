import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

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

import MantenimientoPage from './modules/mantenimiento/pages/MantenimientoPage';

import { useEffect, useState } from 'react';


// ============================================================
// RUTAS PRINCIPALES DEL SISTEMA
// ============================================================

const RUTAS_PRINCIPALES = new Set([
  '/mina',
  '/planta',
  '/infraestructura',
  '/equipos',
  '/alarmas',
  '/eventos',
  '/metricas',
  '/configuracion',
  '/notificaciones',
  '/mantenimiento',
]);


// ============================================================
// NORMALIZAR RUTA
// ============================================================

function normalizarRuta(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/dashboard';
  }

  const limpia = pathname.replace(/\/+$/, '');

  return limpia || '/dashboard';
}


// ============================================================
// OBTENER PADRE JERÁRQUICO
// ============================================================

function obtenerPadreRuta(
  pathname: string,
  search = ''
): string | null {
  const ruta = normalizarRuta(pathname);

  // ----------------------------------------------------------
  // DASHBOARD = RAÍZ DEL SISTEMA
  // ----------------------------------------------------------

  if (ruta === '/dashboard') {
    return null;
  }

  // ----------------------------------------------------------
  // EQUIPOS
  // ----------------------------------------------------------

  if (ruta === '/equipos') {
    return '/dashboard';
  }

  if (ruta === '/equipos/nuevo') {
    return '/equipos';
  }

  const equipoEditar =
    ruta.match(/^\/equipos\/(\d+)\/editar$/);

  if (equipoEditar) {
    return `/equipos/${equipoEditar[1]}`;
  }

  const equipoDetalle =
    ruta.match(/^\/equipos\/(\d+)$/);

  if (equipoDetalle) {
    return '/equipos';
  }

  // ----------------------------------------------------------
  // MANTENIMIENTO CON EQUIPO
  // ----------------------------------------------------------

  if (ruta === '/mantenimiento') {
    const params = new URLSearchParams(search);
    const equipoId = params.get('equipoId');

    if (equipoId) {
      return `/equipos/${equipoId}`;
    }

    return '/dashboard';
  }

  // ----------------------------------------------------------
  // TODAS LAS RUTAS PRINCIPALES
  // ----------------------------------------------------------

  if (RUTAS_PRINCIPALES.has(ruta)) {
    return '/dashboard';
  }

  // ----------------------------------------------------------
  // CUALQUIER OTRA RUTA
  // ----------------------------------------------------------

  return '/dashboard';
}


// ============================================================
// NAVEGACIÓN JERÁRQUICA
// ============================================================

function useNavegacionJerarquica() {
  const navigate = useNavigate();
  const location = useLocation();

  function ir(
    destino: string,
    replaceForzado?: boolean
  ) {
    const urlDestino =
      new URL(
        destino,
        window.location.origin
      );

    const rutaActual =
      normalizarRuta(
        location.pathname
      );

    const rutaDestino =
      normalizarRuta(
        urlDestino.pathname
      );

    const searchDestino =
      urlDestino.search;

    const padreActual =
      obtenerPadreRuta(
        rutaActual,
        location.search
      );

    const padreDestino =
      obtenerPadreRuta(
        rutaDestino,
        searchDestino
      );

    let replace = false;

    // --------------------------------------------------------
    // MISMA RUTA
    // --------------------------------------------------------

    if (rutaDestino === rutaActual) {
      replace = true;
    }

    // --------------------------------------------------------
    // HIJO DIRECTO
    //
    // Ejemplo:
    // /dashboard -> /planta
    // /equipos -> /equipos/5
    // /equipos/5 -> /equipos/5/editar
    //
    // SE AGREGA AL HISTORIAL
    // --------------------------------------------------------

    else if (
      padreDestino === rutaActual
    ) {
      replace = false;
    }

    // --------------------------------------------------------
    // HERMANO
    //
    // Ejemplo:
    //
    // /planta -> /equipos
    //
    // Ambos pertenecen a:
    //
    // /dashboard
    //
    // NO queremos guardar /planta
    //
    // Se reemplaza.
    // --------------------------------------------------------

    else if (
      padreDestino !== null &&
      padreDestino === padreActual
    ) {
      replace = true;
    }

    // --------------------------------------------------------
    // SUBIR AL PADRE
    // --------------------------------------------------------

    else if (
      rutaDestino === padreActual
    ) {
      replace = true;
    }

    // --------------------------------------------------------
    // DASHBOARD SIEMPRE ES RAÍZ
    // --------------------------------------------------------

    else if (
      rutaDestino === '/dashboard'
    ) {
      replace = true;
    }

    // --------------------------------------------------------
    // POR SEGURIDAD:
    // SI CAMBIAMOS DE RAMA,
    // REEMPLAZAMOS EL ESTADO ACTUAL
    // --------------------------------------------------------

    else {
      replace = true;
    }

    if (
      replaceForzado !== undefined
    ) {
      replace = replaceForzado;
    }

    navigate(destino, {
      replace,
    });
  }

  function atras() {
    const actual = normalizarRuta(location.pathname);
    const padre = obtenerPadreRuta(actual);

    if (padre === '/dashboard') {
      window.history.back();
      return;
    }

    if (!padre) {
      window.history.back();
      return;
    }

    navigate(padre, { replace: true });
  }

  return {
    ir,
    atras,
  };
}


// ============================================================
// DASHBOARD
// ============================================================

function DashboardRoute() {
  const { ir } =
    useNavegacionJerarquica();

  const [
    isConnected,
    setIsConnected,
  ] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/equipos')
      .then((r) =>
        setIsConnected(r.ok)
      )
      .catch(() =>
        setIsConnected(false)
      );

    const interval =
      setInterval(() => {
        fetch('/api/equipos')
          .then((r) =>
            setIsConnected(r.ok)
          )
          .catch(() =>
            setIsConnected(false)
          );
      }, 30000);

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <Dashboard
      onNavigate={(page) =>
        ir(`/${page}`)
      }
      isConnected={isConnected}
    />
  );
}


// ============================================================
// EQUIPOS
// ============================================================

function EquiposRoute() {
  const { ir } =
    useNavegacionJerarquica();

  return (
    <EquiposPage
      onNavigate={(page, params) => {
        if (
          page === 'equipo-detalle'
        ) {
          ir(
            `/equipos/${params.id}`
          );
          return;
        }

        if (
          page === 'crear'
        ) {
          ir('/equipos/nuevo');
          return;
        }

        ir(`/${page}`);
      }}
    />
  );
}


// ============================================================
// DETALLE EQUIPO
// ============================================================

function EquipoDetailRoute() {
  const { id } =
    useParams();

  const { ir, atras } =
    useNavegacionJerarquica();

  const equipoId =
    Number(id);

  return (
    <EquipoDetailPage
      equipo={{
        id: equipoId,
      }}
      onNavigate={(
        page,
        params
      ) => {
        if (
          page ===
          'editar-equipo'
        ) {
          ir(
            `/equipos/${params.id}/editar`
          );
          return;
        }

        if (
          page ===
          'mantenimiento'
        ) {
          ir(
            `/mantenimiento?equipoId=${equipoId}`
          );
          return;
        }

        ir(`/${page}`);
      }}
      onBack={atras}
    />
  );
}


// ============================================================
// CREAR EQUIPO
// ============================================================

function EquipoFormRoute() {
  const navigate = useNavigate();

  return (
    <EquipoFormPage
      onNavigate={(page) => {
        if (page === 'equipos') {
          navigate('/equipos', {
            replace: true,
          });
          return;
        }

        navigate(`/${page}`, {
          replace: true,
        });
      }}
    />
  );
}


// ============================================================
// EDITAR EQUIPO
// ============================================================

function EquipoEditRoute() {
  const { id } =
    useParams();

  const { ir, atras } =
    useNavegacionJerarquica();

  return (
    <EquipoEditPage
      equipo={{
        id: Number(id),
      }}
      onNavigate={(page) =>
        ir(`/${page}`)
      }
      onBack={atras}
    />
  );
}


// ============================================================
// MANTENIMIENTO
// ============================================================

function MantenimientoRoute() {
  const params = new URLSearchParams(window.location.search);
  const equipoId = Number(params.get('equipoId'));

  return (
    <MantenimientoPage
      equipoId={equipoId || undefined}
    />
  );
}

// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>

          {/* ------------------------------------------------
              RAÍZ EXTERNA
              ------------------------------------------------ */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* ------------------------------------------------
              RAÍZ DEL SISTEMA
              ------------------------------------------------ */}

          <Route
            path="/dashboard"
            element={
              <DashboardRoute />
            }
          />

          {/* ------------------------------------------------
              EQUIPOS
              ------------------------------------------------ */}

          <Route
            path="/equipos"
            element={
              <EquiposRoute />
            }
          />

          <Route
            path="/equipos/nuevo"
            element={
              <EquipoFormRoute />
            }
          />

          <Route
            path="/equipos/:id"
            element={
              <EquipoDetailRoute />
            }
          />

          <Route
            path="/equipos/:id/editar"
            element={
              <EquipoEditRoute />
            }
          />

          {/* ------------------------------------------------
              MÓDULOS PRINCIPALES
              ------------------------------------------------ */}

          <Route
            path="/alarmas"
            element={
              <AlarmasPage
                onNavigate={() => {}}
                onBack={() => {
                  window.location.href =
                    '/dashboard';
                }}
              />
            }
          />

          <Route
            path="/eventos"
            element={
              <EventosPage
                onNavigate={() => {}}
                onBack={() => {
                  window.location.href =
                    '/dashboard';
                }}
              />
            }
          />

          <Route
            path="/metricas"
            element={
              <MetricasPage
                onNavigate={() => {}}
                onBack={() => {
                  window.location.href =
                    '/dashboard';
                }}
              />
            }
          />

          <Route
            path="/configuracion"
            element={
              <ConfiguracionPage
                onNavigate={() => {}}
                onBack={() => {
                  window.location.href =
                    '/dashboard';
                }}
              />
            }
          />

          <Route
            path="/notificaciones"
            element={
              <NotificacionesPage
                onNavigate={() => {}}
                onBack={() => {
                  window.location.href =
                    '/dashboard';
                }}
              />
            }
          />

          {/* ------------------------------------------------
              ÁREAS
              ------------------------------------------------ */}

          <Route
            path="/mina"
            element={
              <MinaPanel />
            }
          />

          <Route
            path="/planta/*"
            element={
              <PlantaPanel />
            }
          />

          <Route
            path="/infraestructura"
            element={
              <InfraestructuraPanel />
            }
          />

          {/* ------------------------------------------------
              MANTENIMIENTO
              ------------------------------------------------ */}

          <Route
            path="/mantenimiento"
            element={
              <MantenimientoRoute />
            }
          />

          {/* ------------------------------------------------
              CUALQUIER OTRA RUTA
              ------------------------------------------------ */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}