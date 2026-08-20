interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unidad?: string;
}

export function ChartTooltip({ active, payload, label, unidad = '' }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      fontSize: 12,
    }}>
      {label && (
        <div style={{ fontWeight: 700, marginBottom: 4, color: '#1f2329' }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5e6573' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: entry.color || entry.fill || '#C45A1A',
          }} />
          <span>{entry.name}:</span>
          <strong>
            {entry.value}
            {unidad}
          </strong>
        </div>
      ))}
    </div>
  );
}