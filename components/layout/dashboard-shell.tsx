"use client";

import { useState, type ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Toaster } from "./toaster";
import { CampusProvider } from "@/components/providers/campus-provider";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <CampusProvider>
      <div className="min-h-screen bg-canvas text-ink">
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && (
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-30 bg-black/35 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <main className="lg:pl-64">
          <Header onOpenMenu={() => setMenuOpen(true)} />
          {children}
        </main>
        <Toaster />
      </div>
    </CampusProvider>
  );
}
