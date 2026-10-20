"use client";

import useSWR from "swr";
import { useEffect, useRef } from "react";
import { MENU_STORAGE_KEY } from "@/lib/menuCache";

export type MenuItem = {
  className: string;
  href?: string;
  span: string;
  eventKey?: string;
  children?: MenuItem[];
};

type MenuResponse = { data: MenuItem[] };

const fetcher = async (url: string): Promise<MenuResponse> => {
  // 1. Busca en localStorage primero
  try {
    const cached = localStorage.getItem(MENU_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // 2. Si no hay caché, llama a /api/menu y guarda el resultado
  const res = await fetch(url);
  const data = await res.json();

  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(data));
  } catch {}

  return data;
};

// Menú compartido por SWR: el Sidebar lo carga en cuanto entra a /app (justo después del login),
// así al abrir el menú ya está listo. enabled = false para el checador, que no tiene menú.
export function useMenu(enabled = true) {
  return useSWR<MenuResponse>(enabled ? "/api/menu" : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
}

// Trae el menú actual una vez (permisos o menú cambiados) y reemplaza lo guardado; el caché solo sirve para pintar rápido
export function useMenuRefresh(enabled = true) {
  const { mutate } = useMenu(enabled);

  // Sin caché (recién iniciada la sesión) el fetcher ya trae el menú del servidor: no se repite la petición
  const hadCache = useRef<boolean | null>(null);
  if (hadCache.current === null && typeof window !== "undefined") {
    try { hadCache.current = !!localStorage.getItem(MENU_STORAGE_KEY); } catch { hadCache.current = false; }
  }

  useEffect(() => {
    if (!enabled || !hadCache.current) return;

    fetch("/api/menu", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((fresh) => {
        if (!fresh || !Array.isArray(fresh.data)) return;
        try { localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(fresh)); } catch {}
        mutate(fresh, { revalidate: false });
      })
      .catch(() => {});
  }, [enabled, mutate]);
}
