interface SummaryCardProps {
  label: string;
  value: number | string;
  detail?: string;
}

export function SummaryCard({
  label,
  value,
  detail,
}: SummaryCardProps) {
  return (
    <div className="summary-card">
      <div className="summary-card-label">
        {label}
      </div>

      <div className="summary-card-value">
        {value}
      </div>

      {detail && (
        <div className="summary-card-detail">
          {detail}
        </div>
      )}
    </div>
  );
}