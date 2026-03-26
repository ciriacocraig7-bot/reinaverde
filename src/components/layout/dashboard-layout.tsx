"use client";

import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-container-low">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}
