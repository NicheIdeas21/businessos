import { useState } from 'react';
import {
  LayoutDashboard, Users, CalendarDays, Target, Receipt, Bot, BarChart3, Settings as SettingsIcon,
  PanelLeftClose, PanelLeftOpen, Bell, Plus, ChevronDown, Menu, X, LogOut, RefreshCw,
} from 'lucide-react';
import { useNav, type Route } from '../router';
import { useStore } from '../data/store';
import { Button } from './ui';

const NAV_ITEMS: { route: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'customers', label: 'Customers', icon: Users },
  { route: 'schedule', label: 'Schedule', icon: CalendarDays },
  { route: 'opportunities', label: 'Opportunities', icon: Target },
  { route: 'billing', label: 'Billing', icon: Receipt },
  { route: 'autopilot', label: 'Autopilot', icon: Bot },
  { route: 'reports', label: 'Reports', icon: BarChart3 },
  { route: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { route, navigate } = useNav();
  const { settings, tasks, documents } = useStore();

  const overdueCount = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date('2026-11-17')).length;
  const overdueInvoices = documents.filter(d => d.type === 'invoice' && d.status === 'overdue').length;
  const notifCount = overdueCount + overdueInvoices;

  const width = collapsed ? 'w-[68px]' : 'w-60';

  const content = (
    <div className={`flex h-full flex-col bg-navy-800 text-white ${width} transition-[width] duration-200`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
          <span className="font-bold text-white text-sm">B</span>
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-semibold text-[15px] tracking-tight">BusinessOS</div>
            <div className="text-[10px] text-white/40">One smarter place</div>
          </div>
        )}
        <button
          onClick={onCloseMobile}
          className="ml-auto md:hidden text-white/60 hover:text-white p-1"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = route === item.route;
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              onClick={() => { navigate(item.route); onCloseMobile(); }}
              className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all w-full ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-brand-400' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.route === 'autopilot' && (
                <span className="ml-auto text-[9px] font-semibold uppercase tracking-wide bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded">AI</span>
              )}
              {!collapsed && item.route === 'dashboard' && notifCount > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-danger-500 text-white min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{notifCount}</span>
              )}
              {collapsed && item.route === 'dashboard' && notifCount > 0 && (
                <span className="absolute -ml-1 mt-3 text-[10px] font-semibold bg-danger-500 text-white min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">{notifCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="hidden md:flex border-t border-white/5 p-2.5">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 w-full"
        >
          {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex shrink-0">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn">
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative animate-slideIn">{content}</div>
        </div>
      )}
    </>
  );
}

export function Topbar({ onOpenMobile, onQuickCreate }: { onOpenMobile: () => void; onQuickCreate: () => void }) {
  const { route, navigate } = useNav();
  const { settings, resetDemoData } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { tasks, documents } = useStore();

  const today = new Date('2026-11-17T08:00:00');
  const dateStr = today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

  const overdueTasks = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < today);
  const overdueInvoices = documents.filter(d => d.type === 'invoice' && d.status === 'overdue');
  const notifications = [
    ...overdueTasks.map(t => ({ id: t.id, text: `Overdue task: ${t.title}`, kind: 'task' as const })),
    ...overdueInvoices.map(d => ({ id: d.id, text: `Overdue invoice: ${d.number}`, kind: 'invoice' as const })),
  ];

  const pageTitle = NAV_ITEMS.find(i => i.route === route)?.label || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-cloud-200 h-16 flex items-center px-4 sm:px-6 gap-3">
      <button onClick={onOpenMobile} className="md:hidden text-navy-700 hover:bg-cloud-100 rounded-lg p-1.5" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>

      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-navy-800 truncate">{pageTitle}</h1>
        <p className="text-xs text-cloud-500 hidden sm:block">{dateStr}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button onClick={onQuickCreate} size="sm" className="hidden sm:inline-flex">
          <Plus className="w-4 h-4" /> Quick create
        </Button>
        <Button onClick={onQuickCreate} size="sm" className="sm:hidden !px-2" aria-label="Quick create">
          <Plus className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setBellOpen(v => !v); setProfileOpen(false); }}
            className="relative text-navy-600 hover:bg-cloud-100 rounded-lg p-2 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 text-[10px] font-semibold bg-danger-500 text-white min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">{notifications.length}</span>
            )}
          </button>
          {bellOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 card shadow-pop z-20 animate-slideUp">
                <div className="px-4 py-3 border-b border-cloud-200 font-medium text-sm text-navy-800">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-cloud-500 text-center">You're all caught up.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="px-4 py-2.5 border-b border-cloud-100 text-sm hover:bg-cloud-50">
                        <div className="flex items-start gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.kind === 'task' ? 'bg-warning-500' : 'bg-danger-500'}`} />
                          <span className="text-navy-700">{n.text}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={() => { setBellOpen(false); navigate('dashboard'); }} className="w-full text-center text-sm text-brand-600 hover:bg-cloud-50 py-2.5">
                  View all on dashboard
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(v => !v); setBellOpen(false); }}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-cloud-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {settings.ownerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <ChevronDown className="w-4 h-4 text-cloud-500 hidden sm:block" />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 card shadow-pop z-20 animate-slideUp">
                <div className="px-4 py-3 border-b border-cloud-200">
                  <div className="font-medium text-sm text-navy-800">{settings.ownerName}</div>
                  <div className="text-xs text-cloud-500">{settings.email}</div>
                  <div className="text-xs text-cloud-500 mt-1">{settings.businessName}</div>
                </div>
                <div className="py-1">
                  <button onClick={() => { setProfileOpen(false); navigate('settings'); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-navy-700 hover:bg-cloud-50">
                    <SettingsIcon className="w-4 h-4 text-cloud-500" /> Settings
                  </button>
                  <button onClick={() => { if (confirm('Reset all demo data to the original sample? This will discard your changes.')) { resetDemoData(); setProfileOpen(false); navigate('dashboard'); } }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-navy-700 hover:bg-cloud-50">
                    <RefreshCw className="w-4 h-4 text-cloud-500" /> Reset demo data
                  </button>
                  <button onClick={() => { setProfileOpen(false); navigate('settings'); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-navy-700 hover:bg-cloud-50">
                    <LogOut className="w-4 h-4 text-cloud-500" /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
