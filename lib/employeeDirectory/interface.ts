import { IPhone } from "../devices/interface";

export interface IEmployeeDirectory {
    id: number;
    idCheck: number;
    name: string;
    lastName: string;
    fullName: string;
    picture?: string;
    department?: { id: number; nameDepartment: string };
    position?: { id: number; namePosition: string };
    branch?: { id: number; name: string };
    extensions: string[];
    emailsCompany: string[];
    phonesCompany: IPhone[];
}

export interface IEmployeeDirectoryQuery {
    page: number;
    limit: number;
    search?: string;
    idDepartment?: string;
    branch?: string;
}
