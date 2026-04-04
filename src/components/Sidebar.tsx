"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-slate-800 p-2 text-white md:hidden"
      >
        {open ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-slate-900 text-white transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
          <span className="text-2xl font-bold text-emerald-400">MiCaja</span>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-6">
          <div className="rounded-lg bg-slate-800 p-3 text-xs text-slate-400">
            <p>Datos desde Google Sheets</p>
            <p className="mt-1 text-slate-500">Fase 1 - MVP</p>
          </div>
        </div>
      </aside>
    </>
  );
}
