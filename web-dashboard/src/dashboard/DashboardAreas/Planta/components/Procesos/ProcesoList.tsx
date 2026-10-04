import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { ProcesoForm } from './ProcesoForm';
import {
  eliminarProceso,
  type Proceso,
} from '../../services/plantaEstructuraApi';

interface Props {
  procesos: Proceso[];
  loading: boolean;
  onReload: () => void;
}

export function ProcesoList({
  procesos,
  loading,
  onReload,
}: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editar, setEditar] = useState<Proceso | null>(null);
    
  const [menuAbierto, setMenuAbierto] =
    useState<number | null>(null);

  const [menuPosicion, setMenuPosicion] = useState({
    top: 0,
    left: 0,
  });

  const menuBotonRef =
    useRef<HTMLButtonElement | null>(null);

  const cerrarForm = () => {
    setMostrarForm(false);
    setEditar(null);
  };

  const guardado = async () => {
    cerrarForm(); 
    onReload();
  };

  function actualizarPosicionMenu() {
    const boton = menuBotonRef.current;

    if (!boton) {
      return;
    }

    const rect = boton.getBoundingClientRect();

    const ancho = 150;
    const alto = 80;
    const margen = 8;

    let left = rect.right - ancho;
    let top = rect.bottom + margen;

    if (left < margen) {
      left = margen;
    }

    if (left + ancho > window.innerWidth - margen) {
      left = window.innerWidth - ancho - margen;
    }

    if (top + alto > window.innerHeight - margen) {
      top = rect.top - alto - margen;
    }

    if (top < margen) {
      top = margen;
    }

    setMenuPosicion({
      top,
      left,
    });
  }

  function abrirMenu(
    evento: React.MouseEvent<HTMLButtonElement>,
    procesoId: number
  ) {
    menuBotonRef.current =
      evento.currentTarget;

    setMenuAbierto(
      menuAbierto === procesoId
        ? null
        : procesoId
    );
  }

  useEffect(() => {
    if (
      menuAbierto === null ||
      !menuBotonRef.current
    ) {
      return;
    }

    actualizarPosicionMenu();

    const manejarScroll = () => {
      actualizarPosicionMenu();
    };

    const manejarResize = () => {
      actualizarPosicionMenu();
    };

    window.addEventListener(
      'scroll',
      manejarScroll,
      true
    );

    window.addEventListener(
      'resize',
      manejarResize
    );

    return () => {
      window.removeEventListener(
        'scroll',
        manejarScroll,
        true
      );

      window.removeEventListener(
        'resize',
        manejarResize
      );
    };
  }, [menuAbierto]);

  async function eliminar(
    proceso: Proceso
  ) {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar el proceso "${proceso.nombre}"?\n\n` +
      `Los subprocesos no serán eliminados. ` +
      `Quedarán sin proceso padre y podrán reasignarse posteriormente.`
    );

    if (!confirmado) {
      return;
    }

    try {
      await eliminarProceso(proceso.id);

      setMenuAbierto(null);

      onReload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el proceso'
      );
    }
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Procesos</h3>
          <p>
            Procesos principales de la planta.
          </p>
        </div>

        {!mostrarForm && !editar && (
          <button
            type="button"
            className="planta-add-btn"
            onClick={() => setMostrarForm(true)}
          >
            + Nuevo
          </button>
        )}
      </div>

      {(mostrarForm || editar) && (
        <ProcesoForm
          proceso={editar}
          onSaved={guardado}
          onCancel={cerrarForm}
        />
      )}

      {loading ? (
        <div className="planta-empty">
          Cargando procesos...
        </div>
      ) : procesos.length === 0 ? (
        <div className="planta-empty">
          No hay procesos registrados.
        </div>
      ) : (
        <div className="planta-list">
          {procesos.map((proceso) => (
            <div
              key={proceso.id}
              className="planta-list-item"
            >
              <div className="planta-list-main">
                <div>
                  <strong>{proceso.nombre}</strong>

                  {proceso.descripcion && (
                    <small>
                      {proceso.descripcion}
                    </small>
                  )}
                </div>

                <span>
                  {proceso.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </div>
              <div className="planta-row-actions">

                <button
                  type="button"
                  className="planta-options-btn"
                  onClick={(evento) =>
                    abrirMenu(evento, proceso.id)
                  }
                >
                  Opciones ▾
                </button>

                {menuAbierto === proceso.id &&
                  createPortal(
                    <div
                      className="planta-options-menu"
                      style={{
                        top: menuPosicion.top,
                        left: menuPosicion.left,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditar(proceso);
                          setMostrarForm(false);
                          setMenuAbierto(null);
                        }}
                      >
                        Editar
                      </button>

                      <div className="planta-options-divider" />

                      <button
                        type="button"
                        className="planta-options-delete"
                        onClick={() => eliminar(proceso)}
                      >
                        Eliminar
                      </button>
                    </div>,
                    document.body
                  )}

              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}