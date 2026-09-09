import { useEffect, useState } from 'react';
import { colors } from '../../../theme/colors';

interface Props {
  areaInicial: string;
  tiposIniciales: string[];
  onChangeArea: (area: string) => void;
  onChangeTipos: (tipos: string[]) => void;
}

const AREAS = [
  'MINA',
  'PLANTA',
  'INFRAESTRUCTURA',
] as const;

const OPCIONES_POR_AREA: Record<string, string[]> = {
  MINA: [
    'VARIADOR',
    'ESTACION',
    'GEOFONO',
    'WAPSI',
    'TELEFONO',
    'MODULO GEOESTACION',
  ],

  PLANTA: [
    'PLANTA ELECTRICA (T-EPLANT)',
    'PLANTA MECANICA (T-MPLANT)',
    'PLANTA INSTRUMENTAL (T-EIPLAN)',
  ],

  INFRAESTRUCTURA: [
    'SERVIDOR',
    'SWITCH',
    'RADIO',
    'FIBRA OPTICA',
    'UPS',
    'PC',
    'SUPERFICIE (T-ESUPER)',
  ],
};

export function AreaTipoInput({
  areaInicial,
  tiposIniciales,
  onChangeArea,
  onChangeTipos,
}: Props) {
  const [area, setArea] = useState(areaInicial);
  const [tipos, setTipos] = useState<string[]>(
    tiposIniciales || []
  );

  useEffect(() => {
    setArea(areaInicial);
    setTipos(tiposIniciales || []);
  }, [areaInicial, tiposIniciales]);

  const manejarCambioArea = (
    nuevaArea: string
  ) => {
    setArea(nuevaArea);
    setTipos([]);

    onChangeArea(nuevaArea);
    onChangeTipos([]);
  };

  const alternarTipo = (
    tipo: string
  ) => {
    const existe = tipos.includes(tipo);

    const nuevosTipos = existe
      ? tipos.filter((item) => item !== tipo)
      : [...tipos, tipo];

    setTipos(nuevosTipos);
    onChangeTipos(nuevosTipos);
  };

  const opciones =
    OPCIONES_POR_AREA[area] || [];

  return (
    <div style={{ display: 'contents' }}>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>
          ÁREA *
        </label>

        <select
          value={area}
          onChange={(e) =>
            manejarCambioArea(e.target.value)
          }
          style={selectStyle}
        >
          <option value="">
            Seleccionar área
          </option>

          {AREAS.map((opcion) => (
            <option
              key={opcion}
              value={opcion}
            >
              {opcion}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>

        <label style={labelStyle}>
          TIPO *
        </label>

        {!area ? (
          <div style={disabledBoxStyle}>
            Primero elija área
          </div>
        ) : (
          <div style={tipoContainerStyle}>

            {opciones.map((opcion) => {
              const seleccionado =
                tipos.includes(opcion);

              return (
                <label
                  key={opcion}
                  style={{
                    ...tipoOptionStyle,
                    ...(seleccionado
                      ? tipoSeleccionadoStyle
                      : {}),
                  }}
                >
                  <input
                    type="checkbox"
                    checked={seleccionado}
                    onChange={() =>
                      alternarTipo(opcion)
                    }
                  />

                  <span>
                    {opcion}
                  </span>
                </label>
              );
            })}

          </div>
        )}

        {tipos.length > 0 && (
          <div style={seleccionadosStyle}>
            <strong>
              Tipos seleccionados:
            </strong>

            <div style={{ marginTop: 4 }}>
              {tipos.join(', ')}
            </div>
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

const tipoContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 10,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  background: '#fff',
};

const tipoOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
};

const tipoSeleccionadoStyle: React.CSSProperties = {
  background: '#FFF4D6',
  fontWeight: 600,
};

const seleccionadosStyle: React.CSSProperties = {
  marginTop: 8,
  padding: '8px 10px',
  borderRadius: 6,
  background: '#F7F7F7',
  fontSize: 12,
};

const disabledBoxStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  fontSize: 14,
  color: colors.text.muted,
  background: '#F7F7F7',
};