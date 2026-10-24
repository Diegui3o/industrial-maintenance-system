import { useEffect, useMemo, useState } from 'react';

import {
  getEquipos,
  type Equipo,
} from '../../services/plantaEquiposApi';

interface Props {
  equipoId: number | null;
  onChange: (equipo: Equipo | null) => void;
}

export function ComponenteEquipoSelector({
  equipoId,
  onChange,
}: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setLoading(true);

      try {
        const resultado = await getEquipos();

        if (activo) {
          setEquipos(resultado);
        }
      } catch (error) {
        console.error(
          'Error cargando equipos:',
          error
        );

        if (activo) {
          setEquipos([]);
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    void cargar();

    return () => {
      activo = false;
    };
  }, []);

  const equipoSeleccionado = useMemo(
    () =>
      equipos.find(
        (equipo) => equipo.id === equipoId
      ) ?? null,
    [equipos, equipoId]
  );

  const equiposFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    if (!texto) {
      return equipos;
    }

    return equipos.filter((equipo) =>
      [
        equipo.codigo,
        equipo.nombre,
        equipo.area ?? '',
        equipo.tipo ?? '',
        equipo.fase ?? '',
        equipo.subproceso_nombre ?? '',
        equipo.fabricante ?? '',
        equipo.modelo ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto)
    );
  }, [equipos, busqueda]);

  return (
    <div className="componente-equipo-selector-wrapper">

      <button
        type="button"
        className="componentes-equipo-selector"
        onClick={() =>
          setAbierto((actual) => !actual)
        }
      >
        <div>
          <span>
            Equipo padre
          </span>

          <strong>
            {equipoSeleccionado
              ? equipoSeleccionado.nombre
              : 'Seleccionar equipo'}
          </strong>
        </div>

        <span>
          {abierto ? '▴' : '›'}
        </span>
      </button>

      {abierto && (
        <div className="componente-equipo-dropdown">

          <input
            type="text"
            value={busqueda}
            onChange={(event) =>
              setBusqueda(event.target.value)
            }
            placeholder="Buscar equipo..."
            autoFocus
          />

          {loading && (
            <div className="componente-equipo-dropdown-state">
              Cargando equipos...
            </div>
          )}

          {!loading &&
            equiposFiltrados.length === 0 && (
              <div className="componente-equipo-dropdown-state">
                No se encontraron equipos.
              </div>
            )}

          {!loading &&
            equiposFiltrados.map((equipo) => {
              // 🏷️ Mostramos la fase limpia y el subproceso sin duplicar palabras
              const faseTexto = equipo.fase ? equipo.fase.trim() : '';
              const subprocesoTexto = equipo.subproceso_nombre ? equipo.subproceso_nombre.trim() : '';
              
              // Evitamos duplicar si el subproceso ya incluye la fase o viceversa
              const subtitulo = [faseTexto, subprocesoTexto]
                .filter(Boolean)
                .filter((val, idx, arr) => arr.indexOf(val) === idx) // remueve duplicados exactos si los hubiera
                .join(' - ') || 'Sin información';

              return (
                <button
                  key={equipo.id}
                  type="button"
                  className={`componente-equipo-option ${
                    equipo.id === equipoId
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => {
                    onChange(equipo);
                    setAbierto(false);
                    setBusqueda('');
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '2px' }}>
                    <strong style={{ fontSize: '13px', color: '#2c3e50' }}>
                      {equipo.nombre}
                    </strong>

                    <span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 500 }}>
                      {subtitulo}
                    </span>
                  </div>

                  {equipo.id === equipoId && (
                    <span className="componente-equipo-check">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

        </div>
      )}

    </div>
  );
}
