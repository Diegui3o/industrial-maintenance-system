import React from 'react';

interface InsightProps {
  children: React.ReactNode;
}

export function Insight({ children }: InsightProps) {
  return <div className="chart-insight">{children}</div>;
}