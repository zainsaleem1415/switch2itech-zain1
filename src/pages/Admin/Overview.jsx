import React from 'react';
import { useAuth } from '../../context/ContextProvider';
import { Loader2 } from 'lucide-react';
import Top from './Top';
import Main from './Main';
import Bottom from './Bottom';
import ManagerDashboard from '../Dashboard/ManagerDashboard';
import DeveloperDashboard from '../Dashboard/DeveloperDashboard';

const Overview = () => {
  const { role, loading } = useAuth();

  // Always wait for auth to resolve before rendering anything.
  // This prevents the role being null → Navigate → redirect loop.
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Admin: full dashboard
  if (role === 'admin') {
    return (
      <div className="min-h-screen bg-background p-8 space-y-8">
        <Top />
        <div className="space-y-8 animate-in fade-in duration-500">
          <Main />
          <Bottom />
        </div>
      </div>
    );
  }

  // Manager
  if (role === 'manager') return <ManagerDashboard />;

  // Developer
  if (role === 'developer') return <DeveloperDashboard />;

  // Client / User / unknown role — show a friendly message instead of
  // redirecting to /login (which was causing the infinite navigate loop:
  // authenticated → Overview → Navigate /login → RequestAuth → Navigate /  → ∞)
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
      <div className="p-4 bg-primary/10 rounded-2xl">
        <Loader2 className="text-primary" size={28} />
      </div>
      <h2 className="text-xl font-extrabold tracking-tight">Setting up your workspace…</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Your account is being configured. If this persists, please contact your administrator.
      </p>
    </div>
  );
};

export default Overview;
