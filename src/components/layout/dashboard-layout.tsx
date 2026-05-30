"use client";

import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="px-6 sm:px-10 py-10 sm:py-12 max-w-[1280px] mx-auto space-y-10">
          {children}
        </div>
      </main>
    </div>
  );
}
