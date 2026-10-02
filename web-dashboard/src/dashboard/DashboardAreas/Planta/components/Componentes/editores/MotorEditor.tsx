import type {
  ComponenteMotorElectrico,
} from '../../../services/plantaComponentesApi';

import './MotorEditor.css';

interface Props {
  motor?: ComponenteMotorElectrico | null;
  onChange: (
    motor: ComponenteMotorElectrico
  ) => void;
}

export function MotorEditor({
  motor,
  onChange,
}: Props) {
  const actual =
    motor ?? {
      componente_id: 0,
    };

  function cambiar(
    campo: keyof ComponenteMotorElectrico,
    valor: string | number | null
  ) {
    onChange({
      ...actual,
      [campo]: valor,
    });
  }

  return (
    <>
      <section className="motor-editor-bloque">
        <div className="motor-editor-titulo">
          <span>04</span>

          <div>
            <h2>Datos eléctricos</h2>

            <p>
              Características eléctricas del motor
            </p>
          </div>
        </div>

        <div className="motor-editor-grid">
          <Campo
            etiqueta="Placa de motor"
            valor={actual.placa_motor}
            onChange={(v) =>
              cambiar(
                'placa_motor',
                v
              )
            }
          />

          <Campo
            etiqueta="Fabricante"
            valor={actual.fabricante}
            onChange={(v) =>
              cambiar(
                'fabricante',
                v
              )
            }
          />

          <Campo
            etiqueta="Código fabricante"
            valor={actual.codigo_fabricante}
            onChange={(v) =>
              cambiar(
                'codigo_fabricante',
                v
              )
            }
          />

          <Campo
            etiqueta="Producto"
            valor={actual.producto}
            onChange={(v) =>
              cambiar(
                'producto',
                v
              )
            }
          />

          <Campo
            etiqueta="Tensión nominal"
            valor={actual.rated_voltage}
            onChange={(v) =>
              cambiar(
                'rated_voltage',
                v
              )
            }
          />

          <Campo
            etiqueta="Corriente nominal"
            valor={actual.rated_current}
            onChange={(v) =>
              cambiar(
                'rated_current',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Frecuencia"
            valor={actual.frequency}
            onChange={(v) =>
              cambiar(
                'frequency',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Fases"
            valor={actual.phases}
            onChange={(v) =>
              cambiar(
                'phases',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Potencia"
            valor={actual.output}
            onChange={(v) =>
              cambiar(
                'output',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="HP"
            valor={actual.horsepower}
            onChange={(v) =>
              cambiar(
                'horsepower',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Factor de potencia"
            valor={actual.power_factor}
            onChange={(v) =>
              cambiar(
                'power_factor',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Eficiencia"
            valor={actual.efficiency}
            onChange={(v) =>
              cambiar(
                'efficiency',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Factor de servicio"
            valor={actual.service_factor}
            onChange={(v) =>
              cambiar(
                'service_factor',
                v
              )
            }
          />

          <Campo
            etiqueta="Conexión"
            valor={actual.connection}
            onChange={(v) =>
              cambiar(
                'connection',
                v
              )
            }
          />

          <Campo
            etiqueta="Norma"
            valor={actual.standard}
            onChange={(v) =>
              cambiar(
                'standard',
                v
              )
            }
          />

          <Campo
            etiqueta="Clasificación NEMA"
            valor={
              actual.nema_classification
            }
            onChange={(v) =>
              cambiar(
                'nema_classification',
                v
              )
            }
          />
        </div>
      </section>

      <section className="motor-editor-bloque">
        <div className="motor-editor-titulo">
          <span>05</span>

          <div>
            <h2>Datos mecánicos</h2>

            <p>
              Características mecánicas y de operación
            </p>
          </div>
        </div>

        <div className="motor-editor-grid">
          <CampoNumero
            etiqueta="Velocidad nominal"
            valor={actual.rated_speed}
            onChange={(v) =>
              cambiar(
                'rated_speed',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Número de polos"
            valor={actual.number_of_poles}
            onChange={(v) =>
              cambiar(
                'number_of_poles',
                v
              )
            }
          />

          <Campo
            etiqueta="Frame"
            valor={actual.frame}
            onChange={(v) =>
              cambiar(
                'frame',
                v
              )
            }
          />

          <Campo
            etiqueta="Montaje"
            valor={actual.mounting}
            onChange={(v) =>
              cambiar(
                'mounting',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Slip"
            valor={actual.slip}
            onChange={(v) =>
              cambiar(
                'slip',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Torque nominal"
            valor={actual.rated_torque}
            onChange={(v) =>
              cambiar(
                'rated_torque',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Torque rotor bloqueado"
            valor={
              actual.locked_rotor_torque
            }
            onChange={(v) =>
              cambiar(
                'locked_rotor_torque',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Torque de ruptura"
            valor={
              actual.breakdown_torque
            }
            onChange={(v) =>
              cambiar(
                'breakdown_torque',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Momento de inercia"
            valor={
              actual.moment_of_inertia
            }
            onChange={(v) =>
              cambiar(
                'moment_of_inertia',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Peso aproximado"
            valor={
              actual.approximate_weight
            }
            onChange={(v) =>
              cambiar(
                'approximate_weight',
                v
              )
            }
          />
        </div>
      </section>

      <section className="motor-editor-bloque">
        <div className="motor-editor-titulo">
          <span>06</span>

          <div>
            <h2>Construcción y protección</h2>
          </div>
        </div>

        <div className="motor-editor-grid">
          <Campo
            etiqueta="Diseño"
            valor={actual.design}
            onChange={(v) =>
              cambiar(
                'design',
                v
              )
            }
          />

          <Campo
            etiqueta="Enclosure"
            valor={actual.enclosure}
            onChange={(v) =>
              cambiar(
                'enclosure',
                v
              )
            }
          />

          <Campo
            etiqueta="Grado de protección"
            valor={
              actual.degree_of_protection
            }
            onChange={(v) =>
              cambiar(
                'degree_of_protection',
                v
              )
            }
          />

          <Campo
            etiqueta="Frame"
            valor={actual.frame}
            onChange={(v) =>
              cambiar(
                'frame',
                v
              )
            }
          />

          <Campo
            etiqueta="Montaje"
            valor={actual.mounting}
            onChange={(v) =>
              cambiar(
                'mounting',
                v
              )
            }
          />

          <Campo
            etiqueta="Clase de aislamiento"
            valor={
              actual.insulation_class
            }
            onChange={(v) =>
              cambiar(
                'insulation_class',
                v
              )
            }
          />

          <Campo
            etiqueta="Duty"
            valor={actual.duty_cycle}
            onChange={(v) =>
              cambiar(
                'duty_cycle',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Elevación de temperatura"
            valor={
              actual.temperature_rise
            }
            onChange={(v) =>
              cambiar(
                'temperature_rise',
                v
              )
            }
          />

          <Campo
            etiqueta="Temperatura ambiente"
            valor={
              actual.ambient_temperature
            }
            onChange={(v) =>
              cambiar(
                'ambient_temperature',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Altitud"
            valor={actual.altitude}
            onChange={(v) =>
              cambiar(
                'altitude',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Nivel de ruido"
            valor={actual.noise_level}
            onChange={(v) =>
              cambiar(
                'noise_level',
                v
              )
            }
          />
        </div>
      </section>

      <section className="motor-editor-bloque">
        <div className="motor-editor-titulo">
          <span>07</span>

          <div>
            <h2>Arranque y operación</h2>
          </div>
        </div>

        <div className="motor-editor-grid">
          <Campo
            etiqueta="Tipo de arranque"
            valor={actual.starting_method}
            onChange={(v) =>
              cambiar(
                'starting_method',
                v
              )
            }
          />

          <Campo
            etiqueta="L-R Amperes"
            valor={actual.l_r_amperes}
            onChange={(v) =>
              cambiar(
                'l_r_amperes',
                v
              )
            }
          />

          <Campo
            etiqueta="LRC"
            valor={actual.lrc}
            onChange={(v) =>
              cambiar(
                'lrc',
                v
              )
            }
          />

          <Campo
            etiqueta="Corriente sin carga"
            valor={
              actual.no_load_current
            }
            onChange={(v) =>
              cambiar(
                'no_load_current',
                v
              )
            }
          />

          <Campo
            etiqueta="Tiempo rotor bloqueado"
            valor={
              actual.locked_rotor_time
            }
            onChange={(v) =>
              cambiar(
                'locked_rotor_time',
                v
              )
            }
          />

          <Campo
            etiqueta="Rotación"
            valor={actual.rotation}
            onChange={(v) =>
              cambiar(
                'rotation',
                v
              )
            }
          />

          <CampoNumero
            etiqueta="Año de fabricación"
            valor={
              actual.year_of_manufacture
            }
            onChange={(v) =>
              cambiar(
                'year_of_manufacture',
                v
              )
            }
          />
        </div>
      </section>

      <section className="motor-editor-bloque">
        <div className="motor-editor-titulo">
          <span>08</span>

          <div>
            <h2>Rodamientos</h2>
          </div>
        </div>

        <div className="motor-editor-grid">
          <Campo
            etiqueta="Rodamiento DE"
            valor={
              actual.bearing_drive_end
            }
            onChange={(v) =>
              cambiar(
                'bearing_drive_end',
                v
              )
            }
          />

          <Campo
            etiqueta="Rodamiento NDE"
            valor={
              actual.bearing_non_drive_end
            }
            onChange={(v) =>
              cambiar(
                'bearing_non_drive_end',
                v
              )
            }
          />

          <Campo
            etiqueta="Rodamiento delantero"
            valor={actual.front_bearing}
            onChange={(v) =>
              cambiar(
                'front_bearing',
                v
              )
            }
          />

          <Campo
            etiqueta="Rodamiento trasero"
            valor={actual.rear_bearing}
            onChange={(v) =>
              cambiar(
                'rear_bearing',
                v
              )
            }
          />
        </div>
      </section>
    </>
  );
}

interface CampoProps {
  etiqueta: string;
  valor?: string | null;
  onChange: (valor: string) => void;
}

function Campo({
  etiqueta,
  valor,
  onChange,
}: CampoProps) {
  return (
    <label className="motor-editor-campo">
      <span>{etiqueta}</span>

      <input
        type="text"
        value={valor ?? ''}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </label>
  );
}

interface CampoNumeroProps {
  etiqueta: string;
  valor?: number | null;
  onChange: (valor: number | null) => void;
}

function CampoNumero({
  etiqueta,
  valor,
  onChange,
}: CampoNumeroProps) {
  return (
    <label className="motor-editor-campo">
      <span>{etiqueta}</span>

      <input
        type="number"
        step="any"
        value={
          valor === null ||
          valor === undefined
            ? ''
            : valor
        }
        onChange={(event) => {
          const texto =
            event.target.value;

          onChange(
            texto === ''
              ? null
              : Number(texto)
          );
        }}
      />
    </label>
  );
}