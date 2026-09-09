import { useEffect, useState } from 'react';
import {
  actualizarClasificacion,
  actualizarSistema,
  crearClasificacion,
  crearSistema,
  getClasificaciones,
  getSistemas,
  type ClasificacionPlanta,
  type SistemaPlanta,
} from '../services/plantaApi';

export function CatalogosPlanta() {
  const [clasificaciones, setClasificaciones] =
    useState<ClasificacionPlanta[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [loading, setLoading] = useState(true);

  const [nuevoTipo, setNuevoTipo] =
    useState<'clasificacion' | 'sistema' | null>(null);

  const [editandoClasificacion, setEditandoClasificacion] =
    useState<ClasificacionPlanta | null>(null);

  const [editandoSistema, setEditandoSistema] =
    useState<SistemaPlanta | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);

    try {
      const [clasificacionesData, sistemasData] =
        await Promise.all([
          getClasificaciones(),
          getSistemas(),
        ]);

      setClasificaciones(clasificacionesData);
      setSistemas(sistemasData);
    } catch (error) {
      console.error(
        'Error cargando catálogos:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setNuevoTipo(null);
    setEditandoClasificacion(null);
    setEditandoSistema(null);
  };

  const nuevo = (
    tipo: 'clasificacion' | 'sistema'
  ) => {
    limpiarFormulario();
    setNuevoTipo(tipo);
  };

  const editarClasificacion = (
    item: ClasificacionPlanta
  ) => {
    setNuevoTipo(null);
    setEditandoSistema(null);
    setEditandoClasificacion(item);
    setNombre(item.nombre);
    setDescripcion(item.descripcion || '');
  };

  const editarSistema = (
    item: SistemaPlanta
  ) => {
    setNuevoTipo(null);
    setEditandoClasificacion(null);
    setEditandoSistema(item);
    setNombre(item.nombre);
    setDescripcion(item.descripcion || '');
  };

  const guardar = async () => {
    if (!nombre.trim() || guardando) return;

    setGuardando(true);

    try {
      if (editandoClasificacion) {
        await actualizarClasificacion(
          editandoClasificacion.id,
          {
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim() || undefined,
            activo: editandoClasificacion.activo,
          }
        );
      } else if (editandoSistema) {
        await actualizarSistema(
          editandoSistema.id,
          {
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim() || undefined,
            activo: editandoSistema.activo,
          }
        );
      } else if (nuevoTipo === 'clasificacion') {
        await crearClasificacion({
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || undefined,
        });
      } else if (nuevoTipo === 'sistema') {
        await crearSistema({
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || undefined,
        });
      }

      limpiarFormulario();
      await cargar();
    } catch (error) {
      console.error(
        'Error guardando catálogo:',
        error
      );

      alert(
        'No se pudo guardar el registro.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Catálogos de planta</h3>

          <p>
            Administra clasificaciones y sistemas
            disponibles para los equipos.
          </p>
        </div>
      </div>

      {(nuevoTipo ||
        editandoClasificacion ||
        editandoSistema) && (
        <div className="planta-form">

          <h4>
            {editandoClasificacion
              ? 'Editar clasificación'
              : editandoSistema
              ? 'Editar sistema'
              : nuevoTipo === 'clasificacion'
              ? 'Nueva clasificación'
              : 'Nuevo sistema'}
          </h4>

          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
          />

          <input
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
          />

          <div className="planta-form-actions">

            <button
              className="planta-cancel-btn"
              onClick={limpiarFormulario}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              className="planta-save-btn"
              onClick={guardar}
              disabled={
                !nombre.trim() || guardando
              }
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar'}
            </button>

          </div>
        </div>
      )}

      {loading ? (
        <div className="planta-empty">
          Cargando catálogos...
        </div>
      ) : (
        <div className="planta-dual-grid">

          <div>
            <div className="planta-card-header">
              <div>
                <h4>Clasificaciones</h4>
              </div>

              <button
                className="planta-add-btn"
                onClick={() =>
                  nuevo('clasificacion')
                }
              >
                + Nueva
              </button>
            </div>

            <div className="planta-list">

              {clasificaciones.length === 0 && (
                <div className="planta-empty">
                  No hay clasificaciones.
                </div>
              )}

              {clasificaciones.map((item) => (
                <div
                  key={item.id}
                  className="planta-list-item"
                >
                  <div>
                    <strong>
                      {item.nombre}
                    </strong>

                    <small>
                      {item.descripcion ||
                        'Sin descripción'}
                    </small>
                  </div>

                  <button
                    className="planta-edit-btn"
                    onClick={() =>
                      editarClasificacion(
                        item
                      )
                    }
                  >
                    Editar
                  </button>
                </div>
              ))}

            </div>
          </div>

          <div>
            <div className="planta-card-header">
              <div>
                <h4>Sistemas</h4>
              </div>

              <button
                className="planta-add-btn"
                onClick={() =>
                  nuevo('sistema')
                }
              >
                + Nuevo
              </button>
            </div>

            <div className="planta-list">

              {sistemas.length === 0 && (
                <div className="planta-empty">
                  No hay sistemas.
                </div>
              )}

              {sistemas.map((item) => (
                <div
                  key={item.id}
                  className="planta-list-item"
                >
                  <div>
                    <strong>
                      {item.nombre}
                    </strong>

                    <small>
                      {item.descripcion ||
                        'Sin descripción'}
                    </small>
                  </div>

                  <button
                    className="planta-edit-btn"
                    onClick={() =>
                      editarSistema(item)
                    }
                  >
                    Editar
                  </button>
                </div>
              ))}

            </div>
          </div>

        </div>
      )}
    </section>
  );
}