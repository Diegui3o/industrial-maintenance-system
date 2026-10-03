import { useState } from 'react';

import type { Componente } from '../../services/plantaComponentesApi';
import type { Equipo } from '../../services/plantaEquiposApi';

import { ComponenteEditor } from './ComponenteEditor';

import './ComponenteFicha.css';

interface Props {
  componente: Componente;
  equipo?: Equipo;
  onVolver: () => void;
  onGuardado?: (componente: Componente) => void;
}

function valor(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') {
    return '—';
  }

  return String(valor);
}

function fecha(valorFecha?: string | null): string {
  if (!valorFecha) {
    return '—';
  }

  const fecha = new Date(valorFecha);

  if (Number.isNaN(fecha.getTime())) {
    return valorFecha;
  }

  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface CampoProps {
  etiqueta: string;
  valor: unknown;
}

function Campo({ etiqueta, valor: valorCampo }: CampoProps) {
  return (
    <div className="componente-ficha-campo">
      <span>{etiqueta}</span>
      <strong>{valor(valorCampo)}</strong>
    </div>
  );
}

export function ComponenteFicha({
  componente,
  equipo,
  onVolver,
  onGuardado,
}: Props) {
  const [editando, setEditando] = useState(false);

  const motor = componente.motor_electrico;

  if (editando) {
    return (
      <div className="componente-ficha">
        <div className="componente-ficha-titulo">
          <div>
            <span className="componente-ficha-tipo">
              EDITANDO COMPONENTE
            </span>

            <h1>{componente.nombre}</h1>

            <p>
              Modifique los datos del componente y
              guarde los cambios.
            </p>
          </div>
        </div>

        <ComponenteEditor
          componente={componente}
          equipo={equipo}
          onGuardado={(actualizado) => {
            setEditando(false);
            onGuardado?.(actualizado);
          }}
          onCancelar={() => {
            setEditando(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="componente-ficha">

      <div className="componente-ficha-top">
        <span className="componente-ficha-kicker">
          CATÁLOGO TÉCNICO
        </span>
      </div>

      <div className="componente-ficha-titulo">
        <div>
          <span className="componente-ficha-tipo">
            {valor(componente.tipo_componente)}
          </span>

          <h1>{componente.nombre}</h1>

          <p>
            Información técnica completa del componente.
          </p>
        </div>

        <div className="componente-ficha-acciones">
          <span
            className={`componente-ficha-estado ${
              componente.estado_componente ?? 'activo'
            }`}
          >
            {componente.estado_componente === 'fallo'
              ? 'Falla'
              : componente.estado_componente === 'mantenimiento'
                ? 'Mantenimiento'
                : componente.estado_componente === 'inactivo'
                  ? 'Inactivo'
                  : 'Activo'}
          </span>

          <button
            type="button"
            className="componente-ficha-editar"
            onClick={() => setEditando(true)}
          >
            Editar
          </button>
        </div>
      </div>

      <section className="componente-ficha-bloque">
        <div className="componente-ficha-bloque-titulo">
          <h2>Identificación</h2>
        </div>

        <div className="componente-ficha-grid">
          <Campo
            etiqueta="Código interno"
            valor={componente.codigo}
          />

          <Campo
            etiqueta="Código SAP"
            valor={componente.codigo_sap}
          />

          <Campo
            etiqueta="TAG"
            valor={componente.tag}
          />

          <Campo
            etiqueta="Nombre"
            valor={componente.nombre}
          />

          <Campo
            etiqueta="Tipo de componente"
            valor={componente.tipo_componente}
          />

          <Campo
            etiqueta="Marca"
            valor={componente.marca}
          />

          <Campo
            etiqueta="Modelo"
            valor={componente.modelo}
          />

          <Campo
            etiqueta="N° / Serie"
            valor={componente.numero_serie}
          />

          <Campo
            etiqueta="Placa de motor"
            valor={motor?.placa_motor}
          />

          <Campo
            etiqueta="Código fabricante"
            valor={motor?.codigo_fabricante}
          />

          <Campo
            etiqueta="Producto"
            valor={motor?.producto}
          />

          <Campo
            etiqueta="Equipo"
            valor={
              equipo
                ? `${equipo.codigo ?? ''} - ${equipo.nombre}`
                : componente.equipo_id
            }
          />
        </div>
      </section>

      {motor && (
        <>
          <section className="componente-ficha-bloque">
            <div className="componente-ficha-bloque-titulo">
              <h2>Datos eléctricos</h2>
            </div>

            <div className="componente-ficha-grid">
              <Campo
                etiqueta="Tensión nominal"
                valor={motor.rated_voltage}
              />

              <Campo
                etiqueta="Corriente nominal"
                valor={motor.rated_current}
              />

              <Campo
                etiqueta="Frecuencia"
                valor={motor.frequency}
              />

              <Campo
                etiqueta="Fases"
                valor={motor.phases}
              />

              <Campo
                etiqueta="Potencia"
                valor={motor.output}
              />

              <Campo etiqueta="HP" valor={motor.horsepower} />

              <Campo
                etiqueta="Factor de potencia"
                valor={motor.power_factor}
              />

              <Campo
                etiqueta="Eficiencia"
                valor={motor.efficiency}
              />

              <Campo
                etiqueta="Factor de servicio"
                valor={motor.service_factor}
              />

              <Campo
                etiqueta="Conexión"
                valor={motor.connection}
              />

              <Campo
                etiqueta="Norma"
                valor={motor.standard}
              />

              <Campo
                etiqueta="Clasificación NEMA"
                valor={motor.nema_classification}
              />
            </div>
          </section>

          <section className="componente-ficha-bloque">
            <div className="componente-ficha-bloque-titulo">
              <h2>Datos mecánicos</h2>
            </div>

            <div className="componente-ficha-grid">
              <Campo
                etiqueta="Velocidad nominal"
                valor={motor.rated_speed}
              />

              <Campo
                etiqueta="Número de polos"
                valor={motor.number_of_poles}
              />

              <Campo
                etiqueta="Frame"
                valor={motor.frame}
              />

              <Campo
                etiqueta="Montaje"
                valor={motor.mounting}
              />

              <Campo
                etiqueta="Slip"
                valor={motor.slip}
              />

              <Campo
                etiqueta="Torque nominal"
                valor={motor.rated_torque}
              />

              <Campo
                etiqueta="Torque rotor bloqueado"
                valor={motor.locked_rotor_torque}
              />

              <Campo
                etiqueta="Torque de ruptura"
                valor={motor.breakdown_torque}
              />

              <Campo
                etiqueta="Momento de inercia"
                valor={motor.moment_of_inertia}
              />

              <Campo
                etiqueta="Peso aproximado"
                valor={motor.approximate_weight}
              />
            </div>
          </section>

          <section className="componente-ficha-bloque">
            <div className="componente-ficha-bloque-titulo">
              <h2>Construcción y protección</h2>
            </div>

            <div className="componente-ficha-grid">
              <Campo
                etiqueta="Diseño"
                valor={motor.design}
              />

              <Campo
                etiqueta="Enclosure"
                valor={motor.enclosure}
              />

              <Campo
                etiqueta="Grado de protección"
                valor={motor.degree_of_protection}
              />

              <Campo
                etiqueta="Clase de aislamiento"
                valor={motor.insulation_class}
              />

              <Campo
                etiqueta="Duty"
                valor={motor.duty_cycle}
              />

              <Campo
                etiqueta="Elevación de temperatura"
                valor={motor.temperature_rise}
              />

              <Campo
                etiqueta="Temperatura ambiente"
                valor={motor.ambient_temperature}
              />

              <Campo
                etiqueta="Altitud"
                valor={motor.altitude}
              />

              <Campo
                etiqueta="Nivel de ruido"
                valor={motor.noise_level}
              />
            </div>
          </section>

          <section className="componente-ficha-bloque">
            <div className="componente-ficha-bloque-titulo">
              <h2>Arranque y operación</h2>
            </div>

            <div className="componente-ficha-grid">
              <Campo
                etiqueta="Tipo de arranque"
                valor={motor.starting_method}
              />

              <Campo
                etiqueta="L-R Amperes"
                valor={motor.l_r_amperes}
              />

              <Campo
                etiqueta="LRC"
                valor={motor.lrc}
              />

              <Campo
                etiqueta="Corriente sin carga"
                valor={motor.no_load_current}
              />

              <Campo
                etiqueta="Tiempo rotor bloqueado"
                valor={motor.locked_rotor_time}
              />

              <Campo
                etiqueta="Rotación"
                valor={motor.rotation}
              />

              <Campo
                etiqueta="Año de fabricación"
                valor={motor.year_of_manufacture}
              />
            </div>
          </section>

          <section className="componente-ficha-bloque">
            <div className="componente-ficha-bloque-titulo">
              <h2>Rodamientos</h2>
            </div>

            <div className="componente-ficha-grid">
              <Campo
                etiqueta="Rodamiento DE"
                valor={motor.bearing_drive_end}
              />

              <Campo
                etiqueta="Rodamiento NDE"
                valor={motor.bearing_non_drive_end}
              />
            </div>
          </section>
        </>
      )}

      {componente.descripcion && (
        <section className="componente-ficha-bloque">
          <div className="componente-ficha-bloque-titulo">
            <h2>Descripción</h2>
          </div>

          <div className="componente-ficha-descripcion">
            {componente.descripcion}
          </div>
        </section>
      )}

      <section className="componente-ficha-bloque">
        <div className="componente-ficha-bloque-titulo">
          <h2>Registro</h2>
        </div>

        <div className="componente-ficha-grid">
          <Campo
            etiqueta="Fecha de creación"
            valor={fecha(componente.fecha_creacion)}
          />

          <Campo
            etiqueta="Fecha de actualización"
            valor={fecha(componente.fecha_actualizacion)}
          />
        </div>
      </section>

      <div className="componente-ficha-final">
        <button
          type="button"
          className="componente-ficha-volver-final"
          onClick={onVolver}
        >
          ← Volver a Componentes
        </button>
      </div>

    </div>
  );
}