import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
  hideListSelector?: boolean;
}

export function AppLayout({ children, hideListSelector = false }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );

  // Sincroniza com mudanças no localStorage feitas pela Sidebar
  useEffect(() => {
    const handler = () => {
      setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    };
    window.addEventListener('storage', handler);
    // Polling leve para capturar mudanças same-tab
    const interval = setInterval(handler, 100);
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar hideListSelector={hideListSelector} />
      <main
        className={`flex-1 transition-all duration-200 flex flex-col min-h-screen min-w-0 ${
          collapsed ? 'lg:pl-16' : 'lg:pl-56'
        }`}
      >
        <Topbar />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
