'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminSidebarBrand } from '@/components/layout/admin-sidebar-brand';

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setSidebarOpen((open) => !open);
      return;
    }

    setMobileSidebarOpen((open) => !open);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-14 shrink-0">
        <AdminSidebarBrand open={sidebarOpen} className="hidden lg:flex" />
        <AdminHeader onToggleSidebar={toggleSidebar} className="min-w-0 flex-1" />
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="hidden shrink-0 overflow-hidden lg:block">
          <AdminSidebar collapsed={!sidebarOpen} />
        </div>

        {mobileSidebarOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden"
              aria-label="Close sidebar overlay"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 animate-in slide-in-from-left duration-300 lg:hidden">
              <AdminSidebar
                variant="full"
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </div>
          </>
        ) : null}

        <main className="min-w-0 flex-1 bg-dashboard-surface p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
