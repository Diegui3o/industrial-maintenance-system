import { useEffect, useState } from 'react';
import {
  getProcesos,
  getSubprocesos,
  getEquiposPorSubproceso,
  getComponentes,
  getSubcomponentes,
  getRepuestosSubcomponente,
} from '../services/plantaApi';

interface Problema {
  tipo: string;
  descripcion: string;
}

export function EstadoEstructura() {
  const [problemas, setProblemas] =
    useState<Problema[]>([]);

  const [loading, setLoading] = useState(true);

  const analizar = async () => {
    setLoading(true);

    const encontrados: Problema[] = [];

    try {
      const procesos = await getProcesos();

      if (procesos.length === 0) {
        encontrados.push({
          tipo: 'Proceso',
          descripcion:
            'No existen procesos configurados.',
        });
      }

      for (const proceso of procesos) {
        const subprocesos =
          await getSubprocesos(proceso.id);

        if (subprocesos.length === 0) {
          encontrados.push({
            tipo: 'Subproceso',
            descripcion:
              `El proceso "${proceso.nombre}" no tiene subprocesos.`,
          });

          continue;
        }

        for (const subproceso of subprocesos) {
          const equipos =
            await getEquiposPorSubproceso(
              subproceso.id
            );

          if (equipos.length === 0) {
            encontrados.push({
              tipo: 'Equipo',
              descripcion:
                `El subproceso "${subproceso.nombre}" no tiene equipos.`,
            });

            continue;
          }

          for (const equipo of equipos) {
            const componentes =
              await getComponentes(equipo.id);

            if (componentes.length === 0) {
              encontrados.push({
                tipo: 'Componente',
                descripcion:
                  `El equipo "${equipo.codigo}" no tiene componentes.`,
              });

              continue;
            }

            for (const componente of componentes) {
              const subcomponentes =
                await getSubcomponentes(
                  componente.id
                );

              if (subcomponentes.length === 0) {
                encontrados.push({
                  tipo: 'Subcomponente',
                  descripcion:
                    `El componente "${componente.nombre}" no tiene subcomponentes.`,
                });

                continue;
              }

              for (const subcomponente of subcomponentes) {
                const repuestos =
                  await getRepuestosSubcomponente(
                    subcomponente.id
                  );

                if (repuestos.length === 0) {
                  encontrados.push({
                    tipo: 'Repuesto',
                    descripcion:
                      `El subcomponente "${subcomponente.nombre}" no tiene repuestos asociados.`,
                  });
                }
              }
            }
          }
        }
      }

      setProblemas(encontrados);
    } catch (error) {
      console.error(
        'Error analizando estructura:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analizar();
  }, []);

  return (
    <section className="planta-card">

      <div className="planta-card-header">

        <div>
          <h3>Estado de la estructura</h3>

          <p>
            Detecta niveles incompletos dentro de la
            estructura de Planta.
          </p>
        </div>

        <button
          className="planta-add-btn"
          onClick={analizar}
          disabled={loading}
        >
          {loading
            ? 'Analizando...'
            : 'Actualizar'}
        </button>

      </div>

      {loading ? (
        <div className="planta-empty">
          Analizando estructura...
        </div>
      ) : problemas.length === 0 ? (
        <div className="planta-alert success">
          <strong>
            Estructura completa
          </strong>

          <span>
            No se encontraron niveles incompletos.
          </span>
        </div>
      ) : (
        <div className="planta-list">

          {problemas.map((problema, index) => (
            <div
              key={`${problema.tipo}-${index}`}
              className="planta-list-item"
            >
              <div>
                <strong>
                  {problema.tipo}
                </strong>

                <small>
                  {problema.descripcion}
                </small>
              </div>

              <span className="planta-status-warning">
                Pendiente
              </span>
            </div>
          ))}

        </div>
      )}

    </section>
  );
}