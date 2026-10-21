export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import { getBasePermissions } from "@/app/actions/employeePermissions-actions";
import { storeAction } from "@/app/actions/storeActions";
import BasePermissionsClient from "@/components/employeePermissions/BasePermissionsClient";

async function BasePermissionsView() {
  const [{ session }, base] = await Promise.all([storeAction(), getBasePermissions()]);
  const canUpdate = (session?.permissions ?? []).some((p) => p.text === "actualizar_permisos_empleados");

  return (
    <BasePermissionsClient
      initialData={base.data}
      errorMessage={base.success ? "" : base.message}
      canUpdate={canUpdate}
    />
  );
}

export default function PageEmployeePermissions() {
  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <BasePermissionsView />
    </Suspense>
  );
}
