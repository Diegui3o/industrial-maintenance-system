import { colors } from '../../../theme/colors';

interface Props {
  tags: any[];
  onDesvincular: (id: number) => void;
}

export default function UmbralesTable({ tags, onDesvincular }: Props) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      border: `1px solid ${colors.border}`,
      overflowX: 'auto'
    }}>
      <div style={{
        padding: '14px 20px',
        background: '#f8fafc',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: 15, color: colors.text.secondary }}>
          Tags PI Asignados y Umbrales Activos
        </h3>
        <span style={{
          fontSize: 12,
          background: '#e0f2fe',
          color: '#0369a1',
          padding: '4px 10px',
          borderRadius: 12,
          fontWeight: 600
        }}>
          {tags.length} Tags Vinculados
        </span>
      </div>

      <table style={{
        width: '100%',
        minWidth: 850,
        borderCollapse: 'collapse',
        textAlign: 'left'
      }}>
        <thead>
          <tr style={{
            background: '#f1f5f9',
            borderBottom: `1px solid ${colors.border}`,
            fontSize: 12,
            color: colors.text.muted,
            textTransform: 'uppercase'
          }}>
            <th style={{ padding: 12 }}>Tag PI System</th>
            <th style={{ padding: 12 }}>Descripción</th>
            <th style={{ padding: 12 }}>Ubicación jerárquica</th>
            <th style={{ padding: 12 }}>Rango (Mín - Máx)</th>
            <th style={{ padding: 12 }}>Severidad</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tags.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                No hay umbrales registrados.
              </td>
            </tr>
          ) : tags.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
              <td style={{ padding: 14, fontWeight: 700, color: '#0284c7' }}>
                {item.tag}
              </td>
              <td style={{ padding: 14, color: colors.text.secondary }}>
                {item.descripcion || item.tag}
              </td>
              <td style={{ padding: 14, color: colors.text.muted }}>
                {item.nivel}
              </td>
              <td style={{ padding: 14, fontWeight: 600 }}>
                {item.min ?? '—'} - {item.max ?? '—'} {item.unidad || ''}
              </td>
              <td style={{ padding: 14 }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: item.severidad === 'critica' ? '#fee2e2'
                    : item.severidad === 'alta' ? '#ffedd5'
                    : item.severidad === 'media' ? '#e0f2fe' : '#f1f5f9',
                  color: item.severidad === 'critica' ? '#991b1b'
                    : item.severidad === 'alta' ? '#c2410c'
                    : '#0369a1'
                }}>
                  {item.severidad}
                </span>
              </td>
              <td style={{ padding: 14, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => onDesvincular(item.id)}
                  style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: 0,
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  Desvincular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}