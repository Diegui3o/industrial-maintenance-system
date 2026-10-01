import type { ComponenteMotorElectrico } from '../../services/plantaComponentesApi';

interface Props {
  datos: Partial<ComponenteMotorElectrico>;
  onChange: (
    campo: keyof Omit<ComponenteMotorElectrico, 'componente_id'>,
    valor: string | number | null
  ) => void;
}

export function ComponenteMotorFicha({
  datos,
  onChange,
}: Props) {
  const texto = (
    campo: keyof Omit<ComponenteMotorElectrico, 'componente_id'>,
    label: string,
    placeholder?: string
  ) => (
    <label className="componente-form-field">
      <span>{label}</span>

      <input
        type="text"
        value={(datos[campo] ?? '') as string | number}
        onChange={(event) =>
          onChange(campo, event.target.value || null)
        }
        placeholder={placeholder}
      />
    </label>
  );

  const numero = (
    campo: keyof Omit<ComponenteMotorElectrico, 'componente_id'>,
    label: string,
    placeholder?: string
  ) => (
    <label className="componente-form-field">
      <span>{label}</span>

      <input
        type="number"
        step="any"
        value={(datos[campo] ?? '') as string | number}
        onChange={(event) =>
          onChange(
            campo,
            event.target.value === ''
              ? null
              : Number(event.target.value)
          )
        }
        placeholder={placeholder}
      />
    </label>
  );

  return (
    <div className="componente-motor-ficha">

      <div className="componente-ficha-group">
        <div className="componente-ficha-group-title">
          Identificación del motor
        </div>

        <div className="componente-form-grid">
          {texto(
            'placa_motor',
            'Placa del motor'
          )}

          {texto(
            'fabricante',
            'Fabricante'
          )}

          {texto(
            'codigo_fabricante',
            'Código fabricante'
          )}

          {texto(
            'producto',
            'Producto'
          )}
        </div>
      </div>

      <div className="componente-ficha-group">
        <div className="componente-ficha-group-title">
          Características eléctricas
        </div>

        <div className="componente-form-grid">
          {texto(
            'rated_voltage',
            'Tensión nominal',
            '220/380/440 V'
          )}

          {texto(
            'rated_current',
            'Corriente nominal',
            '102/59.1/51.0 A'
          )}

          {numero(
            'frequency',
            'Frecuencia (Hz)',
            '60'
          )}

          {numero(
            'phases',
            'Número de fases',
            '3'
          )}

          {numero(
            'power_factor',
            'Factor de potencia',
            '0.82'
          )}

          {numero(
            'efficiency',
            'Eficiencia (%)'
          )}

          {numero(
            'service_factor',
            'Factor de servicio',
            '1.25'
          )}

          {numero(
            'output',
            'Potencia de salida (kW)',
            '30'
          )}

          {numero(
            'rated_speed',
            'Velocidad nominal (rpm)',
            '1781'
          )}
        </div>
      </div>

      <div className="componente-ficha-group">
        <div className="componente-ficha-group-title">
          Construcción
        </div>

        <div className="componente-form-grid">
          {numero(
            'number_of_poles',
            'Número de polos',
            '4'
          )}

          {texto(
            'design',
            'Diseño',
            'N'
          )}

          {texto(
            'enclosure',
            'Enclosure',
            'IC411 - TFVE'
          )}

          {texto(
            'degree_of_protection',
            'Grado de protección',
            'IPW55'
          )}

          {texto(
            'frame',
            'Frame',
            '200M'
          )}

          {texto(
            'mounting',
            'Montaje',
            'B3D'
          )}

          {texto(
            'insulation_class',
            'Clase de aislamiento',
            'F'
          )}

          {texto(
            'duty_cycle',
            'Ciclo de trabajo',
            'S1'
          )}
        </div>
      </div>

      <div className="componente-ficha-group">
        <div className="componente-ficha-group-title">
          Características de operación
        </div>

        <div className="componente-form-grid">
          {numero(
            'slip',
            'Deslizamiento (%)',
            '1.06'
          )}

          {numero(
            'rated_torque',
            'Torque nominal (kgfm)',
            '16.4'
          )}

          {numero(
            'locked_rotor_torque',
            'Torque rotor bloqueado (%)',
            '290'
          )}

          {numero(
            'breakdown_torque',
            'Torque de ruptura (%)',
            '310'
          )}

          {texto(
            'starting_method',
            'Método de arranque',
            'Direct On Line'
          )}

          {texto(
            'l_r_amperes',
            'L.R. Amperes',
            '816/473/408 A'
          )}

          {texto(
            'lrc',
            'LRC',
            '8.0'
          )}

          {texto(
            'no_load_current',
            'Corriente sin carga',
            '48.0/27.8/24.0 A'
          )}

          {texto(
            'locked_rotor_time',
            'Tiempo rotor bloqueado',
            '18s (cold) 10s (hot)'
          )}

          {texto(
            'rotation',
            'Rotación',
            'Both (CW and CCW)'
          )}
        </div>
      </div>

      <div className="componente-ficha-group">
        <div className="componente-ficha-group-title">
          Instalación y ambiente
        </div>

        <div className="componente-form-grid">
          {numero(
            'moment_of_inertia',
            'Momento de inercia (kgm²)',
            '0.3202'
          )}

          {numero(
            'temperature_rise',
            'Elevación de temperatura (K)',
            '80'
          )}

          {texto(
            'ambient_temperature',
            'Temperatura ambiente',
            '-20°C a +40°C'
          )}

          {numero(
            'altitude',
            'Altitud (m s. n. m.)',
            '1000'
          )}

          {numero(
            'noise_level',
            'Nivel de ruido (dB(A))',
            '66.0'
          )}

          {numero(
            'approximate_weight',
            'Peso aproximado (kg)',
            '233'
          )}
        </div>
      </div>

      <div className="componente-ficha-group">
        <div className="componente-ficha-group-title">
          Rodamientos
        </div>

        <div className="componente-form-grid">
          {texto(
            'bearing_drive_end',
            'Rodamiento DE',
            '6312 ZZ C3'
          )}

          {texto(
            'bearing_non_drive_end',
            'Rodamiento NDE',
            '6212 ZZ C3'
          )}

          {texto(
            'front_bearing',
            'Rodamiento delantero'
          )}

          {texto(
            'rear_bearing',
            'Rodamiento trasero'
          )}
        </div>
      </div>

      <div className="componente-ficha-group">
        <div className="componente-ficha-group-title">
          Normativa y fabricación
        </div>

        <div className="componente-form-grid">
          {texto(
            'connection',
            'Conexión'
          )}

          {texto(
            'standard',
            'Norma'
          )}

          {texto(
            'nema_classification',
            'Clasificación NEMA'
          )}

          {numero(
            'year_of_manufacture',
            'Año de fabricación'
          )}
        </div>
      </div>

    </div>
  );
}