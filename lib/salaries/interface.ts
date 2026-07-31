import { UserRole } from "../definitions";

export interface ISalariesEmployees {
    _id?: string;
    id: number;
    name: string;
    lastName: string;
    branch: IBranch;
    gender: "MASCULINO" | "FEMENINO";
    createdAt: string;
    status?: 1 | 2 | 3;
    role: UserRole[];
    dailyWage: number;
    department: IDepartment;
    position: IPosition;
}

export interface INewSalary {
    salary?: number;
    idsEmployees?: number[];
}

interface IBranch {
    name: string;
}

interface IDepartment {
    nameDepartment: string;
}

interface IPosition {
    namePosition: string;
}