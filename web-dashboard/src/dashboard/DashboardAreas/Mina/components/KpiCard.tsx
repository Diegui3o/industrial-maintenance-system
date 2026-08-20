import React from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  icon?: React.ReactNode;
  hint?: string;
}

export function KpiCard({ label, value, suffix, tone = 'default', icon, hint }: KpiCardProps) {
  return (
    <div className={`kpi-card kpi-${tone}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {value}
        {suffix && <span className="kpi-suffix">{suffix}</span>}
      </div>
      {hint && <div className="kpi-hint">{hint}</div>}
    </div>
  );
}