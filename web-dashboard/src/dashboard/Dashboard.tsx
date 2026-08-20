import { DashboardHeader } from './DashboardHeader/DashboardHeader';
import { DashboardSummary } from './DashboardSummary/DashboardSummary';
import { DashboardAreas } from './DashboardAreas/DashboardAreas';
import { DashboardModules } from './DashboardModules/DashboardModules';
import { useDashboardData } from './hooks/useDashboardData';
import { colors } from '../theme/colors';

interface DashboardProps {
  onNavigate: (page: string) => void;
  isConnected: boolean | null;
}

export default function Dashboard({ onNavigate, isConnected }: DashboardProps) {
  const { isLoading, stats } = useDashboardData();

  return (
    <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', flexDirection: 'column' }}>
      <DashboardHeader isConnected={isConnected} />
      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px' }}>
        <DashboardSummary isLoading={isLoading} stats={stats} />
        <DashboardAreas onNavigate={onNavigate} />
        <DashboardModules onNavigate={onNavigate} />
      </main>
    </div>
  );
}