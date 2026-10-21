"use server"

import { Employee, User } from "@/lib/definitions";
import { fetchEmployees } from "./employee-actions";
import { getUserData } from "./user-actions";
import { storeAction } from "./storeActions";

type PersonRef = { id?: number; name?: string; lastName?: string } | null | undefined;

type MeEmployee = User & {
  leader?: PersonRef;
  department?: Employee["department"];
  position?: Employee["position"];
  branch?: Employee["branch"];
};

// Registro mínimo con lo que usan los formularios de solicitudes (nombre, líder y departamento)
function toEmployee(person: PersonRef, extra: Partial<Employee> = {}): Employee {
  return {
    id: Number(person?.id),
    name: person?.name ?? "",
    lastName: person?.lastName ?? "",
    status: 1,
    ...extra,
  } as Employee;
}

/**
 * Empleados para los formularios de solicitudes (permiso, vacaciones, incapacidad, horas extra).
 * - Usuario del sistema: GET /employee/listall, como siempre.
 * - Sesión de empleado que solo captura para sí mismo: su propio registro y su líder salen de /me
 *   (sin /employee/listall, que pide "listar_empleados" y dejaba Empleado y Líder vacíos).
 * - Empleado líder o de Dirección (captura por otros): la lista completa y, si no se pudo, al menos él mismo.
 */
export async function fetchRequestEmployees(): Promise<Employee[]> {
  const { session, apiToken } = await storeAction();

  // El tipo de sesión sale de /me (la sesión de next-auth no lo guarda)
  const meRes = await getUserData({ apiToken: apiToken ?? "" });
  const me = (meRes.success ? meRes.data : null) as unknown as MeEmployee | null;

  if (me?.sessionType !== "employee") {
    const list = await fetchEmployees({ page: 1, limit: 500, status: "1" });
    return list.data ?? [];
  }

  const own: Employee[] = [];
  if (me?.id) {
    // Si él mismo es el líder de su departamento, me.leader apunta a él: el líder lo decide el formulario
    const leader = me.leader?.id && Number(me.leader.id) !== Number(me.id) ? me.leader : null;

    own.push(toEmployee(me, {
      leader: leader ? toEmployee(leader) : null,
      department: me.department,
      position: me.position,
      idDepartment: me.department?.id ?? null,
    }));
    if (leader) own.push(toEmployee(leader));
  }

  const roles = session?.roles;
  const capturesForOthers = !!(roles?.isLeader || roles?.isExtra);
  if (!capturesForOthers) return own;

  const list = await fetchEmployees({ page: 1, limit: 500, status: "1" });
  const employees = list.data ?? [];
  const missing = own.filter((o) => !employees.some((e) => Number(e.id) === Number(o.id)));
  return [...employees, ...missing];
}
