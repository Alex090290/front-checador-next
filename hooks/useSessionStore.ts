"use client"
import { useRef } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

// Sesión de empleado (número de empleado + NIP/contraseña). Las sesiones iniciadas antes de guardar
// sessionType no lo traen: un empleado nunca tiene correo, un usuario del sistema siempre
export function isEmployeeSession(user?: Session["user"]) {
  if (!user) return false;
  if (user.sessionType) return user.sessionType === "employee";
  return !user.email && user.role !== "CHECADOR";
}

export function useSessionSnapshot() {
  const { data: session } = useSession();
  const snapshot = useRef<{
    uid: Session["user"] | undefined;
  } | null>(null);

  if (!snapshot.current && session) {
    const user = session.user;

    // Un empleado de RH entra como empleado: el back le marca isDoh por su departamento, pero en su sesión de
    // empleado los formularios deben comportarse como con cualquier empleado (sus propios datos y campos bloqueados)
    snapshot.current = {
      uid: user && isEmployeeSession(user)
        ? {
          ...user,
          isDoh: false,
          roles: user.roles ? { ...user.roles, isDoh: false, isApproverDoh: false } : user.roles,
        }
        : user || undefined,
    };
  }

  return snapshot.current;
}
