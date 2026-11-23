import { useState } from 'react';
import { StoreProvider } from './data/store';
import { NavProvider, useNav } from './router';
import { Sidebar, Topbar } from './components/Shell';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Schedule } from './pages/Schedule';
import { Opportunities } from './pages/Opportunities';
import { Billing } from './pages/Billing';
import { Autopilot } from './pages/Autopilot';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { QuickCreate } from './components/QuickCreate';

function Pages() {
  const { route } = useNav();
  switch (route) {
    case 'dashboard': return <Dashboard />;
    case 'customers': return <Customers />;
    case 'schedule': return <Schedule />;
    case 'opportunities': return <Opportunities />;
    case 'billing': return <Billing />;
    case 'autopilot': return <Autopilot />;
    case 'reports': return <Reports />;
    case 'settings': return <SettingsPage />;
    default: return <Dashboard />;
  }
}

function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-cloud-100">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} onQuickCreate={() => setQuickOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
            <Pages />
          </div>
        </main>
      </div>
      <QuickCreate open={quickOpen} onClose={() => setQuickOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <NavProvider>
        <Shell />
      </NavProvider>
    </StoreProvider>
  );
}
