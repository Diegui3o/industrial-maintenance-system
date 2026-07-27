export const colors = {
  primary: '#C45A1A',
  primaryDark: '#9C4512',
  background: '#F0F1F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8FA',
  text: { primary: '#1F2329', secondary: '#5E6573', muted: '#8A919F', onPrimary: '#FFFFFF' },
  border: '#DADDE3',
  borderLight: '#E8EAEE',
  status: {
    success: '#2D7A4C', successBg: '#E8F5E9',
    error: '#B93636', errorBg: '#FDE8E8',
    warning: '#A16207', warningBg: '#FEF3C7',
    info: '#2563A0', infoBg: '#EFF6FF',
  },
  estado: { activo: '#2D7A4C', inactivo: '#8A919F', fallo: '#B93636', mantenimiento: '#A16207' }
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const;
export const radius = { sm: 6, md: 8, lg: 10, xl: 12, pill: 999 } as const;
export const shadows = { sm: '0 1px 2px rgba(0,0,0,0.04)', md: '0 2px 8px rgba(0,0,0,0.04)', lg: '0 4px 16px rgba(0,0,0,0.05)' } as const;