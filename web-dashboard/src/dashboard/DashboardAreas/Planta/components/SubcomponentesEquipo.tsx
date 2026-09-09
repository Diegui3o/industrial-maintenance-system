import { useEffect, useState } from 'react';
import {
  actualizarSubcomponente,
  crearSubcomponente,
  getSubcomponentes,
  type Subcomponente,
  type Componente,
} from '../services/plantaApi';
import { RepuestosSubcomponente } from './RepuestosSubcomponente';

interface Props {
  componente: Componente;
}

export function SubcomponentesEquipo({ componente }: Props) {
  const [subcomponentes, setSubcomponentes] = useState<Subcomponente[]>([]);
  const [seleccionado, setSeleccionado] =
    useState<Subcomponente | null>(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Subcomponente | null>(null);

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);

    try {
      const resultado = await getSubcomponentes(componente.id);

      setSubcomponentes(resultado);

      setSeleccionado((actual) => {
        if (!actual) return null;

        return (
          resultado.find((item) => item.id === actual.id) ||
          null
        );
      });
    } catch (error) {
      console.error('Error cargando subcomponentes:', error);
      setSubcomponentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSeleccionado(null);
    setMostrarForm(false);
    setEditando(null);
    cargar();
  }, [componente.id]);

  const abrirNuevo = () => {
    setEditando(null);
    setNombre('');
    setCodigo('');
    setDescripcion('');
    setMostrarForm(true);
  };

  const abrirEditar = (item: Subcomponente) => {
    setEditando(item);
    setNombre(item.nombre);
    setCodigo(item.codigo || '');
    setDescripcion(item.descripcion || '');
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!nombre.trim() || guardando) return;

    setGuardando(true);

    try {
      if (editando) {
        await actualizarSubcomponente(editando.id, {
          componente_id: componente.id,
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          activo: editando.activo,
        });
      } else {
        await crearSubcomponente({
          componente_id: componente.id,
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
        });
      }

      setMostrarForm(false);
      setEditando(null);

      await cargar();
    } catch (error) {
      console.error('Error guardando subcomponente:', error);
      alert('No se pudo guardar el subcomponente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h4>Subcomponentes</h4>
          <p>
            Componente: <strong>{componente.nombre}</strong>
          </p>
        </div>

        <button
          type="button"
          className="planta-btn planta-btn-primary"
          onClick={abrirNuevo}
        >
          + Subcomponente
        </button>
      </div>

      {mostrarForm && (
        <div className="planta-form">
          <h5>
            {editando
              ? 'Editar subcomponente'
              : 'Nuevo subcomponente'}
          </h5>

          <div className="planta-form-grid">
            <label>
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del subcomponente"
              />
            </label>

            <label>
              Código
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código"
              />
            </label>

            <label className="planta-form-full">
              Descripción
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
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
              disabled={!nombre.trim() || guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
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
        <p>Cargando subcomponentes...</p>
      ) : subcomponentes.length === 0 ? (
        <p className="planta-empty">
          Este componente todavía no tiene subcomponentes.
        </p>
      ) : (
        <div className="planta-list">
          {subcomponentes.map((item) => (
            <div
              key={item.id}
              className={`planta-list-item ${
                seleccionado?.id === item.id
                  ? 'seleccionado'
                  : ''
              }`}
              onClick={() => setSeleccionado(item)}
            >
              <div>
                <strong>{item.nombre}</strong>

                {item.codigo && (
                  <span> — {item.codigo}</span>
                )}

                {item.descripcion && (
                  <p>{item.descripcion}</p>
                )}
              </div>

              <button
                type="button"
                className="planta-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  abrirEditar(item);
                }}
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {seleccionado && (
        <RepuestosSubcomponente
          subcomponente={seleccionado}
        />
      )}
    </section>
  );
}