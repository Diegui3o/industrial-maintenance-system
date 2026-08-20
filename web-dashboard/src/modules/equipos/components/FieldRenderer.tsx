import { colors } from '../../../theme/colors';
import { AreaTipoInput } from './AreaTipoInput';

interface Props {
  campo: {
    field: string;
    label: string;
    type?: string;
    placeholder?: string;
  };
  valor: any;
  onChange: (field: string, value: any) => void;
  form?: any;
}

export function FieldRenderer({ campo, valor, onChange, form }: Props) {
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.muted,
    display: 'block',
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 13,
  };

  // === ÁREA + TIPO COMBINADO ===
  if (campo.field === 'area') {
    return (
      <AreaTipoInput
        areaInicial={form?.area || valor || ''}
        tipoInicial={form?.tipo || ''}
        onChangeArea={(area: string) => onChange('area', area)}
        onChangeTipo={(tipo: string) => onChange('tipo', tipo)}
      />
    );
  }

  // === TIPO SEPARADO (por si se usa) ===
  if (campo.field === 'tipo') {
    return null; // Ya se maneja dentro de AreaTipoInput
  }

  switch (campo.type) {
    case 'select_estado':
      return (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{campo.label}</label>
          <select
            value={valor || 'activo'}
            onChange={(e) => onChange(campo.field, e.target.value)}
            style={inputStyle}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="fallo">Fallo</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>
      );

    case 'number':
      return (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{campo.label}</label>
          <input
            type="number"
            value={valor || 0}
            onChange={(e) => onChange(campo.field, Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      );

    case 'date':
      return (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{campo.label}</label>
          <input
            type="date"
            value={valor || ''}
            onChange={(e) => onChange(campo.field, e.target.value)}
            style={inputStyle}
          />
        </div>
      );

    case 'password':
      return (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{campo.label}</label>
          <input
            type="password"
            value={valor || ''}
            onChange={(e) => onChange(campo.field, e.target.value)}
            placeholder={campo.placeholder}
            style={inputStyle}
          />
        </div>
      );

    default:
      return (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{campo.label}</label>
          <input
            type={campo.type || 'text'}
            value={valor ?? ''}
            onChange={(e) => onChange(campo.field, e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder={campo.placeholder}
            style={inputStyle}
          />
        </div>
      );
  }
}