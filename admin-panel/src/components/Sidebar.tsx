"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/espacios", label: "Espacios" },
  { href: "/calendario", label: "Calendario maestro" },
  { href: "/clientes", label: "Clientes" },
  { href: "/pagos", label: "Pagos" },
  { href: "/gastos", label: "Gastos" },
  { href: "/torneos", label: "Torneos" },
  { href: "/reportes", label: "Reportes" },
  { href: "/configuracion", label: "Configuración" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { session, logout } = useAuth();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <p className="text-sm font-semibold">ProyectoClubes</p>
        <p className="text-xs text-gray-500">Panel Administrador</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <p className="truncate text-xs text-gray-500">{session?.email}</p>
        <button
          onClick={logout}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
