import { useEffect, useState } from 'react';

import {
  actualizarComponente,
  type ActualizarComponenteData,
  type Componente,
} from '../../services/plantaComponentesApi';

import type { Equipo } from '../../services/plantaEquiposApi';

import { MotorEditor } from './editores/MotorEditor';

import './ComponenteEditor.css';

interface Props {
  componente: Componente;
  equipo?: Equipo;
  onGuardado: (componente: Componente) => void;
  onCancelar: () => void;
}

interface FormularioGeneral {
  codigo: string;
  codigo_sap: string;
  tag: string;
  nombre: string;
  tipo_componente: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  descripcion: string;
  activo: boolean;
}

function texto(valor: unknown): string {
  if (
    valor === null ||
    valor === undefined
  ) {
    return '';
  }

  return String(valor);
}

function crearFormulario(
  componente: Componente
): FormularioGeneral {
  return {
    codigo: texto(componente.codigo),
    codigo_sap: texto(componente.codigo_sap),
    tag: texto(componente.tag),
    nombre: texto(componente.nombre),
    tipo_componente: texto(
      componente.tipo_componente
    ),
    marca: texto(componente.marca),
    modelo: texto(componente.modelo),
    numero_serie: texto(
      componente.numero_serie
    ),
    descripcion: texto(
      componente.descripcion
    ),
    activo: componente.activo,
  };
}

function textoOpcional(
  valor: string
): string | null {
  const limpio = valor.trim();

  return limpio || null;
}

export function ComponenteEditor({
  componente,
  equipo,
  onGuardado,
  onCancelar,
}: Props) {
  const [formulario, setFormulario] =
    useState<FormularioGeneral>(() =>
      crearFormulario(componente)
    );

  const [motor, setMotor] =
    useState(componente.motor_electrico);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    setFormulario(
      crearFormulario(componente)
    );

    setMotor(
      componente.motor_electrico
    );
  }, [componente]);

  function cambiarGeneral(
    campo: keyof FormularioGeneral,
    valor: string | boolean
  ) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function cambiarTipo(
    tipo: string
  ) {
    cambiarGeneral(
      'tipo_componente',
      tipo
    );
  }

  async function guardar() {
    setError('');
    setGuardando(true);

    try {
      if (!formulario.nombre.trim()) {
        throw new Error(
          'El nombre del componente es obligatorio.'
        );
      }

      if (
        !formulario.tipo_componente.trim()
      ) {
        throw new Error(
          'El tipo de componente es obligatorio.'
        );
      }

      if (!componente.equipo_id) {
        throw new Error(
          'El componente debe tener un equipo asociado.'
        );
      }

      const data: ActualizarComponenteData = {
        equipo_id:
          componente.equipo_id,

        codigo:
          textoOpcional(
            formulario.codigo
          ),

        codigo_sap:
          textoOpcional(
            formulario.codigo_sap
          ),

        tag:
          textoOpcional(
            formulario.tag
          ),

        nombre:
          formulario.nombre.trim(),

        tipo_componente:
          formulario.tipo_componente.trim(),

        marca:
          textoOpcional(
            formulario.marca
          ),

        modelo:
          textoOpcional(
            formulario.modelo
          ),

        numero_serie:
          textoOpcional(
            formulario.numero_serie
          ),

        descripcion:
          textoOpcional(
            formulario.descripcion
          ),

        activo:
          formulario.activo,
      };

      /*
       * Los datos técnicos se agregan
       * según el tipo de componente.
       */
      if (
        formulario.tipo_componente
          .trim()
          .toUpperCase() ===
        'MOTOR ELECTRICO'
      ) {
        data.motor_electrico =
          motor ?? undefined;
      }

      await actualizarComponente(
        componente.id,
        data
      );

      const actualizado: Componente = {
        ...componente,

        codigo:
          data.codigo,

        codigo_sap:
          data.codigo_sap,

        tag:
          data.tag,

        nombre:
          data.nombre,

        tipo_componente:
          data.tipo_componente,

        marca:
          data.marca,

        modelo:
          data.modelo,

        numero_serie:
          data.numero_serie,

        descripcion:
          data.descripcion,

        activo:
          data.activo,

        motor_electrico:
          data.motor_electrico
            ? {
                ...(componente.motor_electrico ?? {}),
                ...data.motor_electrico,
                componente_id:
                  componente.motor_electrico?.componente_id ??
                  componente.id,
              }
            : componente.motor_electrico,
      };

      onGuardado(actualizado);
    } catch (errorGuardado) {
      console.error(
        'Error actualizando componente:',
        errorGuardado
      );

      setError(
        errorGuardado instanceof Error
          ? errorGuardado.message
          : 'No se pudo guardar el componente.'
      );
    } finally {
      setGuardando(false);
    }
  }

  const tipo =
    formulario.tipo_componente
      .trim()
      .toUpperCase();

  return (
    <div className="componente-editor">

      {/* 01 */}
      <section className="componente-editor-bloque">
        <div className="componente-editor-bloque-titulo">
          <span>01</span>

          <div>
            <h2>Identificación</h2>

            <p>
              Datos principales del componente
            </p>
          </div>
        </div>

        <div className="componente-editor-grid">

          <Campo
            etiqueta="Código interno"
            valor={formulario.codigo}
            onChange={(valor) =>
              cambiarGeneral(
                'codigo',
                valor
              )
            }
          />

          <Campo
            etiqueta="Código SAP"
            valor={formulario.codigo_sap}
            onChange={(valor) =>
              cambiarGeneral(
                'codigo_sap',
                valor
              )
            }
          />

          <Campo
            etiqueta="TAG"
            valor={formulario.tag}
            onChange={(valor) =>
              cambiarGeneral(
                'tag',
                valor
              )
            }
          />

          <Campo
            etiqueta="Nombre"
            valor={formulario.nombre}
            onChange={(valor) =>
              cambiarGeneral(
                'nombre',
                valor
              )
            }
          />

          <Campo
            etiqueta="Tipo de componente"
            valor={formulario.tipo_componente}
            tipo="select"
            opciones={[
              'MOTOR ELECTRICO',
              'MODULO',
              'TABLERO',
              'COMPONENTE MECANICO',
              'COMPONENTE INSTRUMENTAL',
              'COMPONENTE SISTEMAS',
              'ARRANCADOR',
              'TANQUE',
              'ACONDICIONADOR',
            ]}
            onChange={cambiarTipo}
          />

          <label className="componente-editor-campo componente-editor-campo-ancho">
            <span>Descripción</span>

            <textarea
              value={
                formulario.descripcion
              }
              onChange={(event) =>
                cambiarGeneral(
                  'descripcion',
                  event.target.value
                )
              }
              rows={3}
            />
          </label>

        </div>
      </section>

      {/* 02 */}
      <section className="componente-editor-bloque">
        <div className="componente-editor-bloque-titulo">
          <span>02</span>

          <div>
            <h2>Equipo asociado</h2>

            <p>
              Define el equipo padre del componente
            </p>
          </div>
        </div>

        <div className="componente-editor-equipo">
          <span>Equipo padre</span>

          <strong>
            {equipo
              ? `${equipo.codigo ?? ''} - ${equipo.nombre}`
              : componente.equipo_id}
          </strong>
        </div>
      </section>

      {/* 03 */}
      <section className="componente-editor-bloque">
        <div className="componente-editor-bloque-titulo">
          <span>03</span>

          <div>
            <h2>Datos generales</h2>

            <p>
              Fabricante y trazabilidad
            </p>
          </div>
        </div>

        <div className="componente-editor-grid">

          <Campo
            etiqueta="Marca / fabricante"
            valor={formulario.marca}
            onChange={(valor) =>
              cambiarGeneral(
                'marca',
                valor
              )
            }
          />

          <Campo
            etiqueta="Modelo"
            valor={formulario.modelo}
            onChange={(valor) =>
              cambiarGeneral(
                'modelo',
                valor
              )
            }
          />

          <Campo
            etiqueta="Número de serie"
            valor={formulario.numero_serie}
            onChange={(valor) =>
              cambiarGeneral(
                'numero_serie',
                valor
              )
            }
          />

          <label className="componente-editor-campo">
            <span>Estado</span>

            <select
              value={
                formulario.activo
                  ? 'activo'
                  : 'inactivo'
              }
              onChange={(event) =>
                cambiarGeneral(
                  'activo',
                  event.target.value ===
                    'activo'
                )
              }
            >
              <option value="activo">
                Activo
              </option>

              <option value="inactivo">
                Inactivo
              </option>
            </select>
          </label>

        </div>
      </section>

      {/* Datos específicos */}
      {tipo === 'MOTOR ELECTRICO' && (
        <MotorEditor
          motor={motor}
          onChange={setMotor}
        />
      )}

      {tipo !== 'MOTOR ELECTRICO' && (
        <section className="componente-editor-bloque">
          <div className="componente-editor-bloque-titulo">
            <span>04</span>

            <div>
              <h2>Datos técnicos</h2>

              <p>
                Este tipo de componente está
                preparado para incorporar su
                ficha técnica.
              </p>
            </div>
          </div>

          <div className="componente-editor-pendiente">
            Los campos técnicos específicos de
            <strong>
              {' '}
              {formulario.tipo_componente}
            </strong>{' '}
            se podrán agregar sin modificar
            los datos generales del componente.
          </div>
        </section>
      )}

      {error && (
        <div className="componente-editor-error">
          {error}
        </div>
      )}

      <div className="componente-editor-acciones">
        <button
          type="button"
          className="componente-editor-cancelar"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="componente-editor-guardar"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando
            ? 'Guardando...'
            : 'Guardar'}
        </button>
      </div>

    </div>
  );
}

interface CampoProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: 'text' | 'select';
  opciones?: string[];
}

function Campo({
  etiqueta,
  valor,
  onChange,
  tipo = 'text',
  opciones = [],
}: CampoProps) {
  return (
    <label className="componente-editor-campo">
      <span>{etiqueta}</span>

      {tipo === 'select' ? (
        <select
          value={valor}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        >
          {opciones.map((opcion) => (
            <option
              key={opcion}
              value={opcion}
            >
              {opcion}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={valor}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />
      )}
    </label>
  );
}