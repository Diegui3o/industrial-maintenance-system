import { useState } from 'react';
import { colors, spacing } from '../theme/colors';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

interface Props {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
  onBack?: () => void
}

export default function EquipoFormPage({ onSuccess, onNavigate }: Props) {
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    area: '',
    tipo: '',
    fase: '',
    fabricante: '',
    modelo: '',
    numero_serie: '',
    critico: false,
    estado_equipo: 'activo',
    fecha_instalacion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: llamar a API
    console.log(form);
    onSuccess();
  };

  const inputStyle = { marginBottom: spacing.md };

  return (
    <Layout
      title="Nuevo Equipo"
      subtitle="Registro de activo industrial"
      onBack={() => onNavigate('equipos')}
    >
      <form onSubmit={handleSubmit}>
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: spacing.lg, fontSize: 16 }}>Datos del Equipo</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Código *
              </label>
              <input
                required
                placeholder="Ej: COMP-001"
                value={form.codigo}
                onChange={e => setForm({ ...form, codigo: e.target.value })}
              />
            </div>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Nombre *
              </label>
              <input
                required
                placeholder="Ej: Compresor Principal"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Área
              </label>
              <input
                placeholder="Ej: Producción"
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
              />
            </div>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Tipo
              </label>
              <input
                placeholder="Ej: Compresor"
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
              />
            </div>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Fabricante
              </label>
              <input
                placeholder="Ej: Siemens"
                value={form.fabricante}
                onChange={e => setForm({ ...form, fabricante: e.target.value })}
              />
            </div>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Modelo
              </label>
              <input
                placeholder="Ej: XJ-2000"
                value={form.modelo}
                onChange={e => setForm({ ...form, modelo: e.target.value })}
              />
            </div>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                N° Serie
              </label>
              <input
                placeholder="Ej: SN123456"
                value={form.numero_serie}
                onChange={e => setForm({ ...form, numero_serie: e.target.value })}
              />
            </div>
            <div style={inputStyle}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Fecha Instalación
              </label>
              <input
                type="date"
                value={form.fecha_instalacion}
                onChange={e => setForm({ ...form, fecha_instalacion: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            <input
              type="checkbox"
              id="critico"
              checked={form.critico}
              onChange={e => setForm({ ...form, critico: e.target.checked })}
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <label htmlFor="critico" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Equipo crítico para operaciones
            </label>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={() => onNavigate('equipos')}>
            Cancelar
          </Button>
          <Button type="submit" icon="💾">
            Guardar Equipo
          </Button>
        </div>
      </form>
    </Layout>
  );
}