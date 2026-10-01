import { useEffect, useState } from 'react';

import { ComponenteEquipoSelector } from './ComponenteEquipoSelector';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const TIPOS_COMPONENTE = [
  'MOTOR ELECTRICO',
  'MODULO',
  'TABLERO',
  'COMPONENTE MECANICO',
  'COMPONENTE INSTRUMENTAL',
  'COMPONENTE SISTEMAS',
  'ARRANCADOR',
  'TANQUE',
  'ACONDICIONADOR',
];

export function ComponentePanel({
  abierto,
  onCerrar,
}: Props) {
  const [tipoComponente, setTipoComponente] =
    useState('');

  const [equipoId, setEquipoId] =
    useState<number | null>(null);

  const [codigoSAP, setCodigoSAP] =
    useState('');

  const [nombre, setNombre] =
    useState('');

  const [tag, setTag] =
    useState('');

  const [marca, setMarca] =
    useState('');

  const [modelo, setModelo] =
    useState('');

  const [numeroSerie, setNumeroSerie] =
    useState('');

  useEffect(() => {
    if (!abierto) {
      return;
    }

    setTipoComponente('');
    setEquipoId(null);
    setCodigoSAP('');
    setNombre('');
    setTag('');
    setMarca('');
    setModelo('');
    setNumeroSerie('');
  }, [abierto]);

  if (!abierto) {
    return null;
  }

  return (
    <>
      <div
        className="componentes-panel-overlay"
        onClick={onCerrar}
      />

      <aside className="componentes-panel">

        <header className="componentes-panel-header">

          <div>
            <span className="componentes-kicker">
              NUEVO REGISTRO
            </span>

            <h3>
              Crear componente
            </h3>

            <p>
              Registra la identificación y
              características principales del
              componente.
            </p>
          </div>

          <button
            type="button"
            className="componentes-panel-close"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>

        </header>

        <div className="componentes-panel-body">

          <section className="componente-panel-section">

            <div className="componente-panel-section-title">
              <span>01</span>

              <div>
                <strong>
                  Identificación
                </strong>

                <small>
                  Información general del componente
                </small>
              </div>
            </div>

            <div className="componente-form-grid">

              <label className="componente-form-field">
                <span>Código SAP</span>

                <input
                  type="text"
                  value={codigoSAP}
                  onChange={(event) =>
                    setCodigoSAP(event.target.value)
                  }
                  placeholder="Ej. 10023456"
                />
              </label>

              <label className="componente-form-field">
                <span>TAG</span>

                <input
                  type="text"
                  value={tag}
                  onChange={(event) =>
                    setTag(event.target.value)
                  }
                  placeholder="Ej. MOT-001"
                />
              </label>

              <label className="componente-form-field full">
                <span>Nombre del componente</span>

                <input
                  type="text"
                  value={nombre}
                  onChange={(event) =>
                    setNombre(event.target.value)
                  }
                  placeholder="Nombre descriptivo"
                />
              </label>

              <label className="componente-form-field full">
                <span>Tipo de componente</span>

                <select
                  value={tipoComponente}
                  onChange={(event) =>
                    setTipoComponente(event.target.value)
                  }
                >
                  <option value="">
                    Seleccionar tipo
                  </option>

                  {TIPOS_COMPONENTE.map((tipo) => (
                    <option
                      key={tipo}
                      value={tipo}
                    >
                      {tipo}
                    </option>
                  ))}
                </select>
              </label>

            </div>

          </section>

          <section className="componente-panel-section">

            <div className="componente-panel-section-title">
              <span>02</span>

              <div>
                <strong>
                  Equipo asociado
                </strong>

                <small>
                  Define el equipo padre
                </small>
              </div>
            </div>

            <ComponenteEquipoSelector
              equipoId={equipoId}
              onChange={(equipo) =>
                setEquipoId(equipo?.id ?? null)
              }
            />

          </section>

          <section className="componente-panel-section">

            <div className="componente-panel-section-title">
              <span>03</span>

              <div>
                <strong>
                  Datos técnicos
                </strong>

                <small>
                  Información técnica principal
                </small>
              </div>
            </div>

            <div className="componente-form-grid">

              <label className="componente-form-field">
                <span>Marca</span>

                <input
                  type="text"
                  value={marca}
                  onChange={(event) =>
                    setMarca(event.target.value)
                  }
                  placeholder="Fabricante"
                />
              </label>

              <label className="componente-form-field">
                <span>Modelo</span>

                <input
                  type="text"
                  value={modelo}
                  onChange={(event) =>
                    setModelo(event.target.value)
                  }
                  placeholder="Modelo"
                />
              </label>

              <label className="componente-form-field full">
                <span>Número de serie</span>

                <input
                  type="text"
                  value={numeroSerie}
                  onChange={(event) =>
                    setNumeroSerie(event.target.value)
                  }
                  placeholder="Número de serie"
                />
              </label>

            </div>

            {tipoComponente === 'MOTOR ELECTRICO' && (
              <div className="componente-ficha-placeholder">

                <div className="componente-ficha-placeholder-icon">
                  ⚙
                </div>

                <div>
                  <strong>
                    Ficha técnica de motor eléctrico
                  </strong>

                  <span>
                    Los datos específicos del motor se
                    completarán en la ficha técnica.
                  </span>
                </div>

              </div>
            )}

          </section>

        </div>

        <footer className="componentes-panel-footer">

          <button
            type="button"
            className="componentes-btn-secondary"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="componentes-btn-primary"
          >
            Guardar componente
          </button>

        </footer>

      </aside>
    </>
  );
}