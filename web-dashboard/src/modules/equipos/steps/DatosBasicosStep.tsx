import { useEffect } from 'react';
import type { EquipoFormData } from '../hooks/useEquipoForm';
import { colors } from '../../../theme/colors';
import { AreaTipoInput } from '../components/AreaTipoInput';

interface Props {
  form: EquipoFormData;
  update: (d: Partial<EquipoFormData>) => void;
}

const formatearFecha = (fecha: string) => {
  if (!fecha) return '';

  const partes = fecha.split('-');

  if (partes.length !== 3) {
    return '';
  }

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
};

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
}) => {
  const esFecha = type === 'date';

  return (
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

      <div
        style={{
          position: 'relative',
        }}
      >
        <input
          type={type}
          lang={esFecha ? 'es-PE' : undefined}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: esFecha ? '11px 42px 11px 12px' : '10px 12px',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 14,
            background: '#ffffff',
            color: colors.text.primary,
            outline: 'none',
            cursor: esFecha ? 'pointer' : 'text',
          }}
        />

        {esFecha && (
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 18,
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          >
            📅
          </span>
        )}
      </div>

      {esFecha && value && (
        <div
          style={{
            marginTop: 5,
            fontSize: 11,
            color: colors.text.muted,
          }}
        >
          Fecha seleccionada: <strong>{formatearFecha(value)}</strong>
        </div>
      )}
    </div>
  );
};

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
      <h3
        style={{
          marginBottom: 20,
          fontSize: 18,
          fontWeight: 700,
          color: colors.text.primary,
        }}
      >
        Datos del equipo
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
            Fase
          </label>

          <select
            value={form.fase}
            onChange={(e) => {
              const value = e.target.value;

              update({
                fase: value,
                fase_ubicacion: value,
              });
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: 14,
              background: '#ffffff',
              color: colors.text.primary,
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
          label="Área Funcional"
          value={form.area_funcional}
          onChange={set('area_funcional')}
          placeholder="Mantenimiento Eléctrico"
        />

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
          label="N° de serie"
          value={form.numero_serie}
          onChange={set('numero_serie')}
          placeholder="SN123456"
        />

        <Field
          label="Fecha de instalación"
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
              background: '#ffffff',
              color: colors.text.primary,
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