import { useState, useEffect } from 'react';
import { colors } from '../../../theme/colors';

interface Props {
  areaInicial: string;
  tipoInicial: string;
  onChangeArea: (area: string) => void;
  onChangeTipo: (tipo: string) => void;
}

const AREAS = ['MINA', 'PLANTA', 'INFRAESTRUCTURA'] as const;

const OPCIONES_POR_AREA: Record<string, string[]> = {
  MINA: ['VARIADOR', 'ESTACION', 'GEOFONO', 'WAPSI', 'TELEFONO', 'MODULO GEOESTACION'],
  PLANTA: ['BOMBA', 'MOTOR', 'CHANCADORA', 'FAJA TRANSPORTADORA', 'ZARANDA', 'MOLINO'],
  INFRAESTRUCTURA: ['SERVIDOR', 'SWITCH', 'RADIO', 'FIBRA OPTICA', 'UPS', 'PC'],
};

export function AreaTipoInput({ areaInicial, tipoInicial, onChangeArea, onChangeTipo }: Props) {
  const [area, setArea] = useState(areaInicial);
  const [tipo, setTipo] = useState(tipoInicial);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [filtradas, setFiltradas] = useState<string[]>([]);

  useEffect(() => {
    setArea(areaInicial);
    setTipo(tipoInicial);
  }, [areaInicial, tipoInicial]);

  const manejarCambioArea = (nuevaArea: string) => {
    setArea(nuevaArea);
    setTipo('');
    onChangeArea(nuevaArea);
    onChangeTipo('');
  };

  const manejarCambioTipo = (valor: string) => {
    const valorMayus = valor.toUpperCase();
    setTipo(valorMayus);
    onChangeTipo(valorMayus);

    if (valorMayus.length > 0 && area) {
      const opciones = OPCIONES_POR_AREA[area] || [];
      const coincidencias = opciones.filter(op => op.includes(valorMayus));
      setFiltradas(coincidencias);
      setMostrarSugerencias(coincidencias.length > 0);
    } else {
      setFiltradas([]);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarSugerencia = (opcion: string) => {
    setTipo(opcion);
    onChangeTipo(opcion);
    setMostrarSugerencias(false);
  };

  return (
    <div style={{ display: 'contents' }}>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>ÁREA *</label>
        <select value={area} onChange={(e) => manejarCambioArea(e.target.value)} style={selectStyle}>
          <option value="">Seleccionar área</option>
          {AREAS.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 14, position: 'relative' }}>
        <label style={labelStyle}>TIPO *</label>
        <input
          value={tipo}
          onChange={(e) => manejarCambioTipo(e.target.value)}
          onFocus={() => {
            if (area && OPCIONES_POR_AREA[area]?.length > 0) {
              setFiltradas(OPCIONES_POR_AREA[area]);
              setMostrarSugerencias(true);
            }
          }}
          onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
          placeholder={area ? 'Escribir o seleccionar tipo...' : 'Primero elija área'}
          disabled={!area}
          style={inputStyle}
        />

        {mostrarSugerencias && filtradas.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 160,
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            {filtradas.map((op) => (
              <div
                key={op}
                onMouseDown={() => seleccionarSugerencia(op)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#1F2329',
                  borderBottom: '1px solid #F0F1F4',
                }}
              >
                {op}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: colors.text.muted,
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  fontSize: 14,
  textTransform: 'uppercase',
};