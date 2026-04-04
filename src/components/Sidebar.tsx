"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FiHome,
  FiDollarSign,
  FiGlobe,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiTruck,
  FiMenu,
  FiX,
} from "react-icons/fi";

const navItems = [
  { href: "/", label: "Dashboard", icon: FiHome },
  { href: "/caja-chile", label: "Caja Chile", icon: FiDollarSign },
  { href: "/caja-colombia", label: "Caja Colombia", icon: FiGlobe },
  { href: "/portafolio", label: "Portafolio", icon: FiTrendingUp },
  { href: "/prestamos", label: "Préstamos", icon: FiUsers },
  { href: "/metas", label: "Metas", icon: FiTarget },
  { href: "/busetas", label: "Busetas", icon: FiTruck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden bg-card border border-border"
      >
        {open ? <FiX size={18} /> : <FiMenu size={18} />}
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <FiDollarSign size={16} className="text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">MiCaja</span>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Nav */}
        <nav className="mt-4 space-y-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon size={16} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Separator className="mb-4 bg-sidebar-border" />
          <p className="text-xs text-sidebar-foreground/40 text-center">
            Sincronizado con Google Sheets
          </p>
        </div>
      </aside>
    </>
  );
}
