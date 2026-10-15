export const MENU_STORAGE_KEY = "menu-data";

// Borra el menú guardado en el navegador (al cerrar sesión, para que el siguiente usuario no vea el anterior)
export function clearMenuCache() {
  try { localStorage.removeItem(MENU_STORAGE_KEY); } catch {}
}
