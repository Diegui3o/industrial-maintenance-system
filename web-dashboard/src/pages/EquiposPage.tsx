import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { colors, spacing } from '../theme/colors'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { getEquipos } from '../services/api'
import ArbolEquipos from './equipos/ArbolEquipos'

interface Props {
  onNavigate: (page: string, params?: any) => void
}

export default function EquiposPage({ onNavigate }: Props) {
  const [filter, setFilter] = useState('')
  const { data: equipos = [], isLoading } = useQuery({
    queryKey: ['equipos'],
    queryFn: getEquipos
  })

  return (
    <Layout title="Equipos" subtitle="Jerarquía de activos industriales" onBack={() => onNavigate('dashboard')}>
      <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <input
            placeholder="Buscar por código o nombre..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14 }}
          />
        </div>
        <Button onClick={() => onNavigate('crear')} icon="➕">Nuevo Equipo</Button>
      </div>

      {isLoading && <p style={{ color: colors.text.muted }}>Cargando equipos...</p>}

      <ArbolEquipos equipos={equipos || []} filter={filter} onNavigate={onNavigate} />

      {!isLoading && equipos.length === 0 && (
        <div style={{ textAlign: 'center', padding: spacing.xxl }}>
          <p style={{ fontSize: 48 }}>📦</p>
          <h3>No hay equipos registrados</h3>
          <p style={{ color: colors.text.muted }}>Crea el primer equipo para empezar.</p>
        </div>
      )}
    </Layout>
  )
}