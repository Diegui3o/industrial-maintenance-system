import Layout from '../../../shared/components/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { colors, spacing } from '../../../theme/colors';
import { useEquipoEdit } from '../hooks/useEquipoEdit';
import { CAMPOS_EQUIPO } from '../config/fieldsConfig';
import { FieldRenderer } from '../components/FieldRenderer';
import { AreaTipoInput } from '../components/AreaTipoInput';

interface Props {
  equipo: any;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export default function EquipoEditPage({ equipo, onNavigate, onBack }: Props) {
  const { form, update, mutation, feedback, errorMsg } = useEquipoEdit(equipo.id, equipo, onNavigate);

  const secciones = [
    { titulo: 'Datos Generales', filtro: 'generales' },
    { titulo: 'Jerarquía', filtro: 'jerarquia' },
    { titulo: 'Dispositivo de Red', filtro: 'red' },
    { titulo: 'Monitoreo por Ping', filtro: 'monitoreo' },
  ];

  return (
    <Layout title={`Editar: ${equipo.codigo}`} subtitle={equipo.nombre} onBack={onBack || (() => onNavigate('equipo-detalle', equipo))}>
      {feedback === 'success' && (
        <div style={{ background: colors.status.successBg, color: colors.status.success, padding: '14px 20px', borderRadius: 12, marginBottom: 20 }}>
          ✅ Equipo actualizado correctamente
        </div>
      )}
      {feedback === 'error' && (
        <div style={{ background: colors.status.errorBg, color: colors.status.error, padding: '14px 20px', borderRadius: 12, marginBottom: 20 }}>
          ❌ Error al actualizar: {errorMsg || 'Revisa los datos e intenta de nuevo'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {secciones.map(seccion => {
          const campos = CAMPOS_EQUIPO.filter(c => c.section === seccion.filtro);
          return (
            <Card key={seccion.filtro} padding={24} hover={false}>
              <h3 style={{ marginBottom: 16 }}>{seccion.titulo}</h3>

              {seccion.filtro === 'generales' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Área y Tipo con autocompletado */}
                  <AreaTipoInput
                    areaInicial={form.area}
                    tipoInicial={form.tipo}
                    onChangeArea={(area: string) => update({ area })}
                    onChangeTipo={(tipo: string) => update({ tipo })}
                  />
                </div>
              )}

              {campos
                .filter(c => c.field !== 'area' && c.field !== 'tipo')
                .map(campo => (
                  <FieldRenderer
                    key={campo.field}
                    campo={campo}
                    valor={form[campo.field]}
                    onChange={(field, value) => update({ [field]: value })}
                    form={form}
                  />
                ))}

              {seccion.filtro === 'generales' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.critico} onChange={e => update({ critico: e.target.checked })} />
                  Equipo crítico
                </label>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg, justifyContent: 'flex-end' }}>
        <Button icon="💾" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </Layout>
  );
}