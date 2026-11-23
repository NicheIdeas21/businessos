import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Route =
  | 'dashboard'
  | 'customers'
  | 'schedule'
  | 'opportunities'
  | 'billing'
  | 'autopilot'
  | 'reports'
  | 'settings';

interface NavContextValue {
  route: Route;
  params: Record<string, string>;
  navigate: (route: Route, params?: Record<string, string>) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('dashboard');
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = useCallback((r: Route, p: Record<string, string> = {}) => {
    setRoute(r);
    setParams(p);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return <NavContext.Provider value={{ route, params, navigate }}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
