import { useEffect, useState } from 'react';
import {
  actualizarRepuesto,
  crearRepuesto,
  getRepuestos,
  type Repuesto,
} from '../../services/plantaApi';

export function RepuestosCatalogo() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Repuesto | null>(null);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);

    try {
      setRepuestos(await getRepuestos());
    } catch (error) {
      console.error('Error cargando repuestos:', error);
      setRepuestos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const nuevo = () => {
    setEditando(null);
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setMostrarForm(true);
  };

  const editar = (repuesto: Repuesto) => {
    setEditando(repuesto);
    setCodigo(repuesto.codigo || '');
    setNombre(repuesto.nombre);
    setDescripcion(repuesto.descripcion || '');
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!nombre.trim() || guardando) return;

    setGuardando(true);

    try {
      if (editando) {
        await actualizarRepuesto(editando.id, {
          codigo: codigo.trim() || undefined,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo: editando.activo,
        });
      } else {
        await crearRepuesto({
          codigo: codigo.trim() || undefined,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
        });
      }

      setMostrarForm(false);
      setEditando(null);

      await cargar();
    } catch (error) {
      console.error('Error guardando repuesto:', error);
      alert('No se pudo guardar el repuesto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Catálogo de repuestos</h3>

          <p>
            Repuestos disponibles para asociar a componentes.
          </p>
        </div>

        <button
          className="planta-add-btn"
          onClick={nuevo}
        >
          + Nuevo repuesto
        </button>
      </div>

      {mostrarForm && (
        <div className="planta-form">

          <h4>
            {editando
              ? 'Editar repuesto'
              : 'Nuevo repuesto'}
          </h4>

          <input
            placeholder="Código SAP / código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />

          <input
            placeholder="Nombre del repuesto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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
              onClick={() => setMostrarForm(false)}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              className="planta-save-btn"
              onClick={guardar}
              disabled={!nombre.trim() || guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>

          </div>
        </div>
      )}

      <div className="planta-list">

        {loading && (
          <div className="planta-empty">
            Cargando repuestos...
          </div>
        )}

        {!loading && repuestos.length === 0 && (
          <div className="planta-alert warning">
            <strong>No existen repuestos</strong>

            <span>
              Crea el catálogo antes de asociarlos a componentes.
            </span>
          </div>
        )}

        {!loading &&
          repuestos.map((repuesto) => (
            <div
              key={repuesto.id}
              className="planta-list-item"
            >
              <div>
                <strong>
                  {repuesto.codigo
                    ? `${repuesto.codigo} — `
                    : ''}
                  {repuesto.nombre}
                </strong>

                <small>
                  {repuesto.descripcion ||
                    'Sin descripción'}
                </small>
              </div>

              <button
                className="planta-edit-btn"
                onClick={() => editar(repuesto)}
              >
                Editar
              </button>
            </div>
          ))}
      </div>

    </section>
  );
}