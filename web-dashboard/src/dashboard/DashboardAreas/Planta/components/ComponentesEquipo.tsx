import { useEffect, useState } from 'react';
import {
  actualizarComponente,
  crearComponente,
  getComponentes,
  type Componente,
  type Equipo,
} from '../services/plantaApi';
import { RepuestosComponente } from './RepuestosComponente';

interface Props {
  equipo: Equipo;
}

export function ComponentesEquipo({ equipo }: Props) {
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [seleccionado, setSeleccionado] =
    useState<Componente | null>(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Componente | null>(null);

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);

    try {
      const resultado = await getComponentes(equipo.id);

      setComponentes(resultado);

      setSeleccionado((actual) => {
        if (!actual) return null;

        return (
          resultado.find((item) => item.id === actual.id) ||
          null
        );
      });
    } catch (error) {
      console.error('Error cargando componentes:', error);
      setComponentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSeleccionado(null);
    setMostrarForm(false);
    setEditando(null);
    cargar();
  }, [equipo.id]);

  const abrirNuevo = () => {
    setEditando(null);
    setNombre('');
    setCodigo('');
    setDescripcion('');
    setMostrarForm(true);
  };

  const abrirEditar = (componente: Componente) => {
    setEditando(componente);
    setNombre(componente.nombre);
    setCodigo(componente.codigo || '');
    setDescripcion(componente.descripcion || '');
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!nombre.trim() || guardando) return;

    setGuardando(true);

    try {
      if (editando) {
        await actualizarComponente(editando.id, {
          equipo_id: equipo.id,
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          activo: editando.activo,
        });
      } else {
        await crearComponente({
          equipo_id: equipo.id,
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
        });
      }

      setMostrarForm(false);
      setEditando(null);

      await cargar();
    } catch (error) {
      console.error('Error guardando componente:', error);
      alert('No se pudo guardar el componente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Componentes</h3>

          <p>
            {equipo.codigo} — {equipo.nombre}
            {' · '}
            {componentes.length} componente(s)
          </p>
        </div>

        <button
          className="planta-add-btn"
          onClick={abrirNuevo}
        >
          + Agregar componente
        </button>
      </div>

      {mostrarForm && (
        <div className="planta-form">

          <h4>
            {editando
              ? 'Editar componente'
              : 'Nuevo componente'}
          </h4>

          <input
            placeholder="Código del componente"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />

          <input
            placeholder="Nombre del componente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
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
            Cargando componentes...
          </div>
        )}

        {!loading && componentes.length === 0 && (
          <div className="planta-alert warning">
            <strong>Equipo sin componentes</strong>

            <span>
              Agrega los componentes que forman parte de este equipo.
            </span>
          </div>
        )}

        {!loading &&
          componentes.map((componente) => (
            <div
              key={componente.id}
              className={`planta-list-item ${
                seleccionado?.id === componente.id
                  ? 'selected'
                  : ''
              }`}
            >
              <button
                style={{
                  flex: 1,
                  border: 0,
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  setSeleccionado(componente)
                }
              >
                <div>
                  <strong>
                    {componente.codigo
                      ? `${componente.codigo} — `
                      : ''}
                    {componente.nombre}
                  </strong>

                  <small>
                    {componente.descripcion ||
                      'Sin descripción'}
                  </small>
                </div>
              </button>

              <button
                className="planta-edit-btn"
                onClick={() =>
                  abrirEditar(componente)
                }
              >
                Editar
              </button>
            </div>
          ))}
      </div>

      {seleccionado && (
        <div style={{ marginTop: 16 }}>
          <RepuestosComponente
            componente={seleccionado}
          />
        </div>
      )}

    </section>
  );
}