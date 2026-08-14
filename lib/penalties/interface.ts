import { IChecks } from "../absences/interface";

export interface IPenaltyForOffeses {
    _id?: string;
    id: number;
    idEmployee: number;
    createFor: number;
    idsAbsencesAndAttendances: number[];
    type: string;
    dateOfAbsence: string[];
    motive?: string;
    signatures: ISignaturesPenalties[];
    createdAt: string;
    updatedAt: string;
    PenaltyForOffensesType?: string;
    notes?: string;

    createForPerson?: {
        _id?: string;
        id: number;
        name: string;
        lastName: string;
    }

    employee?: {
        _id?: string;
        id: number;
        name: string;
        lastName: string;
    }

    absencesAndAttendances: IAbsencesAndAttendances[];
    status?: string;
}

export interface IPenalty {
    idEmployee: number,
    idsAbsencesAndAttendances: number[];
    PenaltyForOffensesType: string;
    dateOfAbsence: string[];
    motive?: string;
    notes: string | null;
}

export interface ISignaturesPenalties {
    _id?: string;
    id: number;
    idSignatory: number;
    name: string;
    key: string;
    url: string;
    status: string;
    label: string;
    sendNotify: boolean;
}

interface IAbsencesAndAttendances {
    _id?: string;
    id: number;
    idEmployee: number;
    idChecadors: number[];
    category: string;
    subCategory: string;
    type: string;
    dateOfAbsence: string;
    createdAt: string;
    checks: IChecks[];
}

export interface IPenaltyAxios {
    _id?: string;
    id: number
}