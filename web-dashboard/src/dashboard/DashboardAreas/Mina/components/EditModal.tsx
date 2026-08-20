import { useState } from 'react';
import { colors, spacing } from '../../../../theme/colors';

interface EditModalProps {
  title: string;
  item: any;
  fields: { key: string; label: string; type?: 'text' | 'number' | 'date' }[];
  onSave: (data: any) => void;
  onClose: () => void;
}

export function EditModal({ title, item, fields, onSave, onClose }: EditModalProps) {
  const [formData, setFormData] = useState<any>({ ...item });

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: colors.surface, borderRadius: 12,
        padding: spacing.lg, maxWidth: 600, width: '90%',
        maxHeight: '80vh', overflow: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <h3 style={{ margin: 0, fontSize: 16, color: colors.text.primary }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
          {fields.map((field) => (
            <div key={field.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                {field.label}
              </label>
              {field.type === 'number' ? (
                <input
                  type="number"
                  value={formData[field.key] || 0}
                  onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                  style={{ width: '100%', padding: 8, border: `1px solid ${colors.border}`, borderRadius: 6 }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  style={{ width: '100%', padding: 8, border: `1px solid ${colors.border}`, borderRadius: 6 }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.lg }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', border: `1px solid ${colors.border}`,
              background: 'transparent', borderRadius: 6, cursor: 'pointer',
              color: colors.text.secondary,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 6,
              background: colors.primary, color: '#fff', cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}