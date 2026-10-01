import { useState } from 'react';

import {
  crearComponente,
  type ComponenteMotorElectrico,
} from '../../services/plantaComponentesApi';

import { ComponenteEquipoSelector } from './ComponenteEquipoSelector';
import { ComponenteMotorFicha } from './ComponenteMotorFicha';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onGuardado?: () => void;
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
  onGuardado,
}: Props) {
  const [tipoComponente, setTipoComponente] =
    useState('');

  const [equipoId, setEquipoId] =
    useState<number | null>(null);

  const [codigo, setCodigo] =
    useState('');

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

  const [descripcion, setDescripcion] =
    useState('');

  const [motor, setMotor] =
    useState<Partial<ComponenteMotorElectrico>>(
      {}
    );

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState('');

  if (!abierto) {
    return null;
  }

  function actualizarMotor(
    campo: keyof Omit<
      ComponenteMotorElectrico,
      'componente_id'
    >,
    valor: string | number | null
  ) {
    setMotor((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardar() {
    setError('');

    if (!equipoId) {
      setError(
        'Debes seleccionar el equipo padre.'
      );
      return;
    }

    if (!nombre.trim()) {
      setError(
        'Debes ingresar el nombre del componente.'
      );
      return;
    }

    if (!tipoComponente) {
      setError(
        'Debes seleccionar el tipo de componente.'
      );
      return;
    }

    setGuardando(true);

    try {
      await crearComponente({
        equipo_id: equipoId,

        codigo: codigo.trim() || null,
        codigo_sap: codigoSAP.trim() || null,
        tag: tag.trim() || null,

        nombre: nombre.trim(),
        tipo_componente: tipoComponente,

        marca: marca.trim() || null,
        modelo: modelo.trim() || null,
        numero_serie:
          numeroSerie.trim() || null,

        descripcion:
          descripcion.trim() || null,

        ...(tipoComponente === 'MOTOR ELECTRICO'
          ? {
              motor_electrico: motor,
            }
          : {}),
      });

      onGuardado?.();
      onCerrar();

    } catch (error) {
      console.error(
        'Error creando componente:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el componente.'
      );

    } finally {
      setGuardando(false);
    }
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
              Registra la identificación,
              asociación y ficha técnica del
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
                  Datos principales del componente
                </small>
              </div>
            </div>

            <div className="componente-form-grid">

              <label className="componente-form-field">
                <span>Código interno</span>

                <input
                  type="text"
                  value={codigo}
                  onChange={(event) =>
                    setCodigo(
                      event.target.value
                    )
                  }
                  placeholder="Código interno"
                />
              </label>

              <label className="componente-form-field">
                <span>Código SAP</span>

                <input
                  type="text"
                  value={codigoSAP}
                  onChange={(event) =>
                    setCodigoSAP(
                      event.target.value
                    )
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
                    setTag(
                      event.target.value
                    )
                  }
                  placeholder="Ej. MOT-001"
                />
              </label>

              <label className="componente-form-field">
                <span>Nombre</span>

                <input
                  type="text"
                  value={nombre}
                  onChange={(event) =>
                    setNombre(
                      event.target.value
                    )
                  }
                  placeholder="Nombre del componente"
                />
              </label>

              <label className="componente-form-field full">
                <span>
                  Tipo de componente
                </span>

                <select
                  value={tipoComponente}
                  onChange={(event) =>
                    setTipoComponente(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Seleccionar tipo
                  </option>

                  {TIPOS_COMPONENTE.map(
                    (tipo) => (
                      <option
                        key={tipo}
                        value={tipo}
                      >
                        {tipo}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="componente-form-field full">
                <span>
                  Descripción
                </span>

                <textarea
                  value={descripcion}
                  onChange={(event) =>
                    setDescripcion(
                      event.target.value
                    )
                  }
                  placeholder="Descripción, función o información adicional"
                  rows={3}
                />
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
                  Define el equipo padre del componente
                </small>
              </div>
            </div>

            <ComponenteEquipoSelector
              equipoId={equipoId}
              onChange={(equipo) =>
                setEquipoId(
                  equipo?.id ?? null
                )
              }
            />

          </section>

          <section className="componente-panel-section">

            <div className="componente-panel-section-title">
              <span>03</span>

              <div>
                <strong>
                  Datos generales
                </strong>

                <small>
                  Fabricante y trazabilidad
                </small>
              </div>
            </div>

            <div className="componente-form-grid">

              <label className="componente-form-field">
                <span>
                  Marca / fabricante
                </span>

                <input
                  type="text"
                  value={marca}
                  onChange={(event) =>
                    setMarca(
                      event.target.value
                    )
                  }
                  placeholder="Fabricante"
                />
              </label>

              <label className="componente-form-field">
                <span>
                  Modelo
                </span>

                <input
                  type="text"
                  value={modelo}
                  onChange={(event) =>
                    setModelo(
                      event.target.value
                    )
                  }
                  placeholder="Modelo"
                />
              </label>

              <label className="componente-form-field full">
                <span>
                  Número de serie
                </span>

                <input
                  type="text"
                  value={numeroSerie}
                  onChange={(event) =>
                    setNumeroSerie(
                      event.target.value
                    )
                  }
                  placeholder="Número de serie"
                />
              </label>

            </div>

          </section>

          {tipoComponente ===
            'MOTOR ELECTRICO' && (
            <section className="componente-panel-section">

              <div className="componente-panel-section-title">
                <span>04</span>

                <div>
                  <strong>
                    Ficha técnica — Motor eléctrico
                  </strong>

                  <small>
                    Características eléctricas,
                    mecánicas, ambientales y de fabricación
                  </small>
                </div>
              </div>

              <ComponenteMotorFicha
                datos={motor}
                onChange={actualizarMotor}
              />

            </section>
          )}

          {tipoComponente &&
            tipoComponente !==
              'MOTOR ELECTRICO' && (
            <section className="componente-panel-section">

              <div className="componente-panel-section-title">
                <span>04</span>

                <div>
                  <strong>
                    Ficha técnica
                  </strong>

                  <small>
                    Características específicas
                    del tipo seleccionado
                  </small>
                </div>
              </div>

              <div className="componente-ficha-placeholder">

                <div className="componente-ficha-placeholder-icon">
                  ⚙
                </div>

                <div>
                  <strong>
                    {tipoComponente}
                  </strong>

                  <span>
                    La ficha técnica específica
                    de este tipo se incorporará
                    con sus propios parámetros.
                  </span>
                </div>

              </div>

            </section>
          )}

          {error && (
            <div className="componente-form-error">
              {error}
            </div>
          )}

        </div>

        <footer className="componentes-panel-footer">

          <button
            type="button"
            className="componentes-btn-secondary"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="componentes-btn-primary"
            onClick={() => void guardar()}
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar componente'}
          </button>

        </footer>

      </aside>
    </>
  );
}