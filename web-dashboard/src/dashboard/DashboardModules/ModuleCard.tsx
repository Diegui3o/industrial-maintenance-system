interface ModuleCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export function ModuleCard({ title, description, onClick }: ModuleCardProps) {
  return (
    <button
      className="module-card"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        padding: '16px 20px',
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #DADDE3)',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = 'var(--color-primary, #C45A1A)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-border, #DADDE3)';
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: 'var(--color-text-primary, #1F2329)',
          marginBottom: 4,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: 12,
          color: 'var(--color-text-muted, #8A919F)',
        }}
      >
        {description}
      </span>
    </button>
  );
}