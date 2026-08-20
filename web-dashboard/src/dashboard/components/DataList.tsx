export function DataList({ items, columns, emptyText }: any) {
  if (!items || items.length === 0) {
    return <p style={{ color: '#68747b', fontSize: 12 }}>{emptyText || 'Sin datos'}</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          {columns.map((col: string) => (
            <th key={col} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #DADDE3', color: '#5E6573' }}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item: any, idx: number) => (
          <tr key={item.id || idx}>
            {columns.map((col: string) => (
              <td key={col} style={{ padding: '8px 12px', borderBottom: '1px solid #F0F1F4' }}>
                {item[col] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}