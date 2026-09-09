import { useEffect, useState } from 'react';
import {
  actualizarSubprocesoSistema,
  crearSubprocesoSistema,
  getSubprocesosSistema,
  type SistemaPlanta,
  type SubprocesoSistemaPlanta,
} from '../services/plantaApi';
import { EquiposSubprocesoSistema } from './EquiposSubprocesoSistema';

interface Props {
  sistema: SistemaPlanta;
}

export function SubprocesosSistema({ sistema }: Props) {
  const [subprocesos, setSubprocesos] =
    useState<SubprocesoSistemaPlanta[]>([]);

  const [seleccionado, setSeleccionado] =
    useState<SubprocesoSistemaPlanta | null>(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] =
    useState<SubprocesoSistemaPlanta | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);

    try {
      const resultado = await getSubprocesosSistema(
        sistema.id
      );

      setSubprocesos(resultado);

      setSeleccionado((actual) => {
        if (!actual) return null;

        return (
          resultado.find(
            (item) => item.id === actual.id
          ) || null
        );
      });
    } catch (error) {
      console.error(
        'Error cargando subprocesos de sistema:',
        error
      );

      setSubprocesos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSeleccionado(null);
    setMostrarForm(false);
    setEditando(null);
    cargar();
  }, [sistema.id]);

  const nuevo = () => {
    setEditando(null);
    setNombre('');
    setDescripcion('');
    setMostrarForm(true);
  };

  const editar = (
    item: SubprocesoSistemaPlanta
  ) => {
    setEditando(item);
    setNombre(item.nombre);
    setDescripcion(item.descripcion || '');
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!nombre.trim() || guardando) return;

    setGuardando(true);

    try {
      if (editando) {
        await actualizarSubprocesoSistema(
          editando.id,
          {
            sistema_id: sistema.id,
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim() || undefined,
            activo: editando.activo,
          }
        );
      } else {
        await crearSubprocesoSistema({
          sistema_id: sistema.id,
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || undefined,
        });
      }

      setMostrarForm(false);
      setEditando(null);

      await cargar();
    } catch (error) {
      console.error(
        'Error guardando subproceso de sistema:',
        error
      );

      alert(
        'No se pudo guardar el subproceso de sistema.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h4>Subprocesos</h4>

          <p>
            Sistema:{' '}
            <strong>{sistema.nombre}</strong>
          </p>
        </div>

        <button
          type="button"
          className="planta-btn planta-btn-primary"
          onClick={nuevo}
        >
          + Subproceso
        </button>
      </div>

      {mostrarForm && (
        <div className="planta-form">
          <h5>
            {editando
              ? 'Editar subproceso'
              : 'Nuevo subproceso'}
          </h5>

          <div className="planta-form-grid">
            <label>
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                placeholder="Nombre del subproceso"
              />
            </label>

            <label className="planta-form-full">
              Descripción
              <textarea
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(e.target.value)
                }
                placeholder="Descripción"
                rows={3}
              />
            </label>
          </div>

          <div className="planta-form-actions">
            <button
              type="button"
              className="planta-btn planta-btn-primary"
              onClick={guardar}
              disabled={
                !nombre.trim() || guardando
              }
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar'}
            </button>

            <button
              type="button"
              className="planta-btn"
              onClick={() => {
                setMostrarForm(false);
                setEditando(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Cargando subprocesos...</p>
      ) : subprocesos.length === 0 ? (
        <p className="planta-empty">
          Este sistema todavía no tiene
          subprocesos.
        </p>
      ) : (
        <div className="planta-list">
          {subprocesos.map((item) => (
            <div
              key={item.id}
              className={`planta-list-item ${
                seleccionado?.id === item.id
                  ? 'seleccionado'
                  : ''
              }`}
              onClick={() =>
                setSeleccionado(item)
              }
            >
              <div>
                <strong>{item.nombre}</strong>

                {item.descripcion && (
                  <p>{item.descripcion}</p>
                )}
              </div>

              <button
                type="button"
                className="planta-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  editar(item);
                }}
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {seleccionado && (
        <EquiposSubprocesoSistema
          subprocesoSistemaId={seleccionado.id}
        />
      )}
    </section>
  );
}