export interface IPrePayroll{
    _id?: string;
    idPrePayRoll: number;
    idPeriod: number;
    idIncidence: number;
    idEmployee: number;
    incidenceRef: string;
    claveNomipaq:string;
    duracion: number;
    fechaNomina: string | null;
    data: Idata;
    fechaIncidencia: string;
    day: string | null;
    complete?: boolean;
    notes?: string;
}

interface Idata{
    _id?: string;
    id: number;
    idEmployee: number;
    category: string | null;
    type: string;
    dateOfAbsence: string;
    createdAt:string;
    updatedAt: string;
    incidenceRef: string;
    employee: {
        id: number;
        name: string;
        lastName: string;
    }
    department: {
        id: number;
        nameDepartment: string;
    }
    position: {
        id: number;
        namePosition: string;
    }
}

export interface IUpdatePrepayroll{
    idPeriod: number;
    idIncidence: number;
    incidenceRef: string;
    fechaNomina?: string | null;
}
