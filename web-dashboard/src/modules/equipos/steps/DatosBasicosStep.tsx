import { useEffect } from 'react';
import type { EquipoFormData } from '../hooks/useEquipoForm';
import { colors } from '../../../theme/colors';
import { AreaTipoInput } from '../components/AreaTipoInput';

interface Props {
  form: EquipoFormData;
  update: (d: Partial<EquipoFormData>) => void;
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: colors.text.muted,
      }}
    >
      {label} {required && '*'}
    </label>

    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        fontSize: 14,
      }}
    />
  </div>
);

export default function DatosBasicosStep({
  form,
  update,
}: Props) {
  const set =
    (k: keyof EquipoFormData) =>
    (v: string) =>
      update({ [k]: v });

  useEffect(() => {
    if (form.area) {
      return;
    }
  }, [form.area]);

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>
        Datos del Equipo
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <Field
          label="Código"
          value={form.codigo}
          onChange={set('codigo')}
          placeholder="COMP-001"
          required
        />

        <Field
          label="Nombre"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Compresor Principal"
          required
        />

        <AreaTipoInput
          areaInicial={form.area}
          tiposIniciales={form.tipos}
          onChangeArea={(area) =>
            update({
              area,
              tipos: [],
              tipo: '',
              tipo_ids: [],
            })
          }
          onChangeTipos={(tipos) =>
            update({
              tipos,
              tipo: tipos.join(', '),
            })
          }
        />

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: colors.text.muted,
            }}
          >
            Fase o Nivel
          </label>

          <select
            value={form.fase_ubicacion}
            onChange={(e) =>
              update({
                fase_ubicacion: e.target.value,
              })
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <option value="">
              Seleccionar fase...
            </option>

            <option value="FASE I">FASE I</option>
            <option value="FASE II">FASE II</option>
            <option value="FASE III">FASE III</option>
            <option value="MINA">MINA</option>
            <option value="INFRAESTRUCTURA">
              INFRAESTRUCTURA
            </option>
          </select>
        </div>

        <Field
          label="Fabricante"
          value={form.fabricante}
          onChange={set('fabricante')}
          placeholder="Siemens"
        />

        <Field
          label="Modelo"
          value={form.modelo}
          onChange={set('modelo')}
          placeholder="XJ-2000"
        />

        <Field
          label="N° Serie"
          value={form.numero_serie}
          onChange={set('numero_serie')}
          placeholder="SN123456"
        />

        <Field
          label="Fecha Instalación"
          value={form.fecha_instalacion}
          onChange={set('fecha_instalacion')}
          type="date"
        />

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: colors.text.muted,
            }}
          >
            Estado *
          </label>

          <select
            value={form.estado_equipo}
            onChange={(e) =>
              set('estado_equipo')(e.target.value)
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="fallo">Fallo</option>
            <option value="mantenimiento">
              Mantenimiento
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}