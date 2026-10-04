import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  eliminarSistema,
  type SistemaPlanta,
} from '../../services/plantaApi';
import { SistemaForm } from './SistemaForm';

interface Props {
  sistemas: SistemaPlanta[];
  onReload: () => void;
}

export function SistemaList({
  sistemas,
  onReload,
}: Props) {
  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [editar, setEditar] =
    useState<SistemaPlanta | null>(null);

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

  const guardado = () => {
    cerrarForm();
    onReload();
  };

  function actualizarPosicionMenu() {
    const boton = menuBotonRef.current;

    if (!boton) {
      return;
    }

    const rect =
      boton.getBoundingClientRect();

    const ancho = 150;
    const alto = 80;
    const margen = 8;

    let left = rect.right - ancho;
    let top = rect.bottom + margen;

    if (left < margen) {
      left = margen;
    }

    if (
      left + ancho >
      window.innerWidth - margen
    ) {
      left =
        window.innerWidth -
        ancho -
        margen;
    }

    if (
      top + alto >
      window.innerHeight - margen
    ) {
      top =
        rect.top -
        alto -
        margen;
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
    sistemaId: number
  ) {
    menuBotonRef.current =
      evento.currentTarget;

    setMenuAbierto(
      menuAbierto === sistemaId
        ? null
        : sistemaId
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
    sistema: SistemaPlanta
  ) {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar el sistema "${sistema.nombre}"?\n\n` +
      `Los subprocesos del sistema no serán eliminados. ` +
      `Quedarán sin sistema padre y podrán reasignarse posteriormente.`
    );

    if (!confirmado) {
      return;
    }

    try {
      await eliminarSistema(sistema.id);

      setMenuAbierto(null);

      onReload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el sistema'
      );
    }
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Sistemas</h3>

          <p>
            Sistemas independientes de la planta.
          </p>
        </div>

        {!mostrarForm && !editar && (
          <button
            type="button"
            className="planta-add-btn"
            onClick={() =>
              setMostrarForm(true)
            }
          >
            + Nuevo
          </button>
        )}
      </div>

      {(mostrarForm || editar) && (
        <SistemaForm
          sistema={editar}
          onSaved={guardado}
          onCancel={cerrarForm}
        />
      )}

      {sistemas.length === 0 ? (
        <div className="planta-empty">
          No hay sistemas registrados.
        </div>
      ) : (
        <div className="planta-list">
          {sistemas.map((sistema) => (
            <div
              key={sistema.id}
              className="planta-list-item"
            >
              <div className="planta-list-main">
                <div>
                  <strong>
                    {sistema.nombre}
                  </strong>

                  {sistema.descripcion && (
                    <small>
                      {sistema.descripcion}
                    </small>
                  )}
                </div>

                <span>
                  {sistema.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </div>

              <div className="planta-row-actions">
                <button
                  type="button"
                  className="planta-options-btn"
                  onClick={(evento) =>
                    abrirMenu(
                      evento,
                      sistema.id
                    )
                  }
                >
                  Opciones ▾
                </button>

                {menuAbierto === sistema.id &&
                  createPortal(
                    <div
                      className="planta-options-menu"
                      style={{
                        position: 'fixed',
                        top: menuPosicion.top,
                        left: menuPosicion.left,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditar(sistema);
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
                        onClick={() =>
                          eliminar(sistema)
                        }
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