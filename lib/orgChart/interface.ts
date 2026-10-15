export type OrgNodeType = 'empresa' | 'departamento' | 'director' | 'gerente' | 'subgerente' | 'empleado';

export interface IOrgNode {
    id: string;
    parentId: string | null;
    type: OrgNodeType;
    name: string;
    idDepartment?: number;
    departmentName?: string;
    idEmployee?: number;
    idCheck?: number;
    position?: string | null;
    picture?: string | null;
    extensions?: string[];
    emailsCompany?: string[];
    total?: number;
}
