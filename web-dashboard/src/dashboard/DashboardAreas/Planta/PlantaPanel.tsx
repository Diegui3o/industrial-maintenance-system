import { useLocation, useNavigate } from 'react-router-dom';

import { DashboardHeader } from '../../DashboardHeader/DashboardHeader';
import { colors } from '../../../theme/colors';

import { PlantaEstructuraPrincipal } from './components/PlantaEstructura/PlantaEstructuraPrincipal';
import { MantenimientosLista } from './components/Mantenimientos/MantenimientosLista';
import { EquiposLista } from './components/Equipos/EquiposLista';
import { MaestroGeneral } from './components/MaestroGeneral/MaestroGeneral';
import { MaestrosComponentes } from './components/MaestrosComponentes/MaestrosComponentes';

import './Planta.css';

type PlantaTab =
  | 'estructura'
  | 'maestro-general'
  | 'maestros-componentes'
  | 'mantenimientos'
  | 'equipos';

function obtenerTab(pathname: string): PlantaTab {
  if (
    pathname ===
    '/planta/maestros-componentes'
  ) {
    return 'maestros-componentes';
  }

  if (
    pathname ===
    '/planta/maestro-general'
  ) {
    return 'maestro-general';
  }

  if (
    pathname ===
    '/planta/mantenimientos'
  ) {
    return 'mantenimientos';
  }

  if (
    pathname ===
    '/planta/equipos'
  ) {
    return 'equipos';
  }

  return 'estructura';
}

export function PlantaPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const tab = obtenerTab(
    location.pathname
  );

  function cambiarTab(nuevoTab: PlantaTab) {
    const rutas: Record<
      PlantaTab,
      string
    > = {
      estructura: '/planta',
      mantenimientos:
        '/planta/mantenimientos',
      equipos:
        '/planta/equipos',
      'maestro-general':
        '/planta/maestro-general',
      'maestros-componentes':
        '/planta/maestros-componentes',
    };

    /*
     * IMPORTANTE:
     *
     * Las pestañas pertenecen a la misma rama
     * /planta.
     *
     * Por eso usamos replace=true.
     *
     * De esta forma:
     *
     * /planta/equipos
     * -> /planta/maestros-componentes
     *
     * no deja "equipos" detrás en el historial.
     */
    navigate(
      rutas[nuevoTab],
      {
        replace: true,
      }
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          colors.background,
      }}
    >
      <DashboardHeader
        isConnected={true}
      />

      <div className="planta-container">
        <div className="area-panel">

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() =>
                navigate('/dashboard', {
                  replace: true,
                })
              }
              className="btn-hover"
              style={{
                background: 'transparent',
                border: `1.5px solid ${colors.border}`,
                borderRadius: 10,
                padding: '8px 14px',
                cursor: 'pointer',
                color: colors.text.secondary,
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ← Volver
            </button>
          </div>

          <div className="area-options">

            <button
              type="button"
              className={
                tab === 'estructura'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                cambiarTab('estructura')
              }
            >
              Estructura
            </button>

            <button
              type="button"
              className={
                tab === 'mantenimientos'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                cambiarTab(
                  'mantenimientos'
                )
              }
            >
              Mantenimientos
            </button>

            <button
              type="button"
              className={
                tab === 'equipos'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                cambiarTab('equipos')
              }
            >
              Equipos
            </button>

            <button
              type="button"
              className={
                tab === 'maestro-general'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                cambiarTab(
                  'maestro-general'
                )
              }
            >
              Master principal
            </button>

            <button
              type="button"
              className={
                tab ===
                'maestros-componentes'
                  ? 'activo'
                  : ''
              }
              onClick={() =>
                cambiarTab(
                  'maestros-componentes'
                )
              }
            >
              Maestros de componentes
            </button>

          </div>

          <div className="area-content">

            {tab === 'estructura' && (
              <PlantaEstructuraPrincipal />
            )}

            {tab === 'mantenimientos' && (
              <MantenimientosLista />
            )}

            {tab === 'equipos' && (
              <EquiposLista />
            )}

            {tab === 'maestro-general' && (
              <MaestroGeneral />
            )}

            {tab ===
              'maestros-componentes' && (
              <MaestrosComponentes />
            )}

          </div>

        </div>
      </div>
    </div>
  );
}