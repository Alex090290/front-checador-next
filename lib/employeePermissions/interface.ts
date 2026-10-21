export type PermissionCatalogItem = { id: number; text: string };

// Permisos base: lista que se copia a cada empleado nuevo y con "Aplicar a todos" (no es un grupo)
export interface IBasePermissionsData {
    permissions: string[];
    updatedAt: string | null;
    updatedBy: unknown;
    employeesMissingBase: number;
    catalog: PermissionCatalogItem[];
}

// Permisos de un empleado (los base + los individuales, todos en su registro)
export interface IEmployeePermissionsData {
    idEmployee: number;
    idCheck: number;
    name: string;
    lastName: string;
    permissions: string[];
    base: string[];
}
