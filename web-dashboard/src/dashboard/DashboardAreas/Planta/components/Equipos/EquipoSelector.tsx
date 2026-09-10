import { useEffect, useMemo, useState } from 'react';
import {
  getEquiposSinUbicar,
  type Equipo,
} from '../../services/plantaApi';

interface Props {
  equiposAsignados: Equipo[];
  onAsignar: (equipo: Equipo) => void;
  guardando: boolean;
}

export function EquipoSelector({
  equiposAsignados,
  onAsignar,
  guardando,
}: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);

    try {
      const resultado = await getEquiposSinUbicar();
      setEquipos(resultado);
    } catch (error) {
      console.error(
        'Error cargando equipos sin ubicar:',
        error
      );

      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const disponibles = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    return equipos
      .filter(
        (equipo) =>
          !equiposAsignados.some(
            (asignado) =>
              asignado.id === equipo.id
          )
      )
      .filter((equipo) => {
        if (!texto) return true;

        return (
          equipo.codigo
            .toLowerCase()
            .includes(texto) ||
          equipo.nombre
            .toLowerCase()
            .includes(texto)
        );
      });
  }, [equipos, equiposAsignados, busqueda]);

  return (
    <div>

      <div className="planta-selector-search">
        <input
          placeholder="Buscar por código o nombre..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando equipos disponibles...
        </div>
      )}

      {!loading &&
        disponibles.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No hay equipos disponibles
            </strong>

            <span>
              Los equipos que ya están ubicados
              en otro subproceso no aparecen aquí.
            </span>
          </div>
        )}

      {!loading &&
        disponibles.length > 0 && (
          <div className="planta-selector-list">

            {disponibles.map((equipo) => (
              <div
                key={equipo.id}
                className="planta-selector-item"
              >
                <div className="planta-selector-info">

                  <strong>
                    {equipo.codigo} — {equipo.nombre}
                  </strong>

                  <small>
                    {equipo.tipo ||
                      'Sin tipo'}

                    {equipo.fabricante
                      ? ` · ${equipo.fabricante}`
                      : ''}

                    {equipo.modelo
                      ? ` · ${equipo.modelo}`
                      : ''}
                  </small>

                </div>

                <button
                  className="planta-add-btn"
                  onClick={() =>
                    onAsignar(equipo)
                  }
                  disabled={guardando}
                >
                  {guardando
                    ? 'Asignando...'
                    : 'Asignar'}
                </button>
              </div>
            ))}

          </div>
        )}

    </div>
  );
}