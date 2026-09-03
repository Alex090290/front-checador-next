import { ISignatures } from "../overTime/interface";

export interface Vacations {
    _id: string;
    id: number;
    idEmployee: number | null;
    dohApproval?: "APPROVED" | "REFUSED" | "PENDING";
    periodDescription: string;
    totalDaysPeriod: number;
    dateInitPeriod: string;
    dateEndPeriod: string;
    idsVacationsRequest: number[];
    idLeader: number | null;
    idPersonDoh: number | null;
    idPeriod: number | null;
    leaderApproval: string;
    daysRequest: number;
    signatures: ISignatures[];
    dateInit: string;
    dateEnd: string;
    isAutomatic: boolean;
    holidayName: string;
    notes: string;

    createForPerson: {
        _id: string;
        id: number;
        name: string;
        lastName: string;
    };
    employee: {
        _id: string;
        id: number;
        name: string;
        lastName: string;
    };
    period: {
        _id: string;
        id: number;
        periodDescription: string;
        dateInitPeriod: string;
        dateEndPeriod: string;
    };
    status: VacationRequestStatus;
    vacationsRequestsData: {
        _id: string;
        id: number;
        idEmployee: number;
        idLeader: number | null;
        idPersonDoh: number | null;
        createFor: number;
        leaderApproval: string;
        dohApproval: string;
        daysRequest: number;
        dateInit: string;
        dateEnd: string;
        holidayName: string;
    }[];
    usedDays: number;
    availableDays: number;
    pendingDays: number;
    createdAt?: string;
    updatedAt?: string;
    daysdaysBrokenDown?: {
        id: number;
        fortnightlyPeriod: number;
        day: string; // ISO
    }[];
    leader?: {
        _id: string;
        id: number;
        name: string;
        lastName: string;
    };
    personDoh?: {
        _id: string;
        id: number;
        name: string;
        lastName: string;
    };

    delete?: {
        delete: boolean;
        whoDeleteIdEmployee: number;
        reaseonDelete: string;
        dateDelete: string;
    }
}

export interface PeriodVacation {
    _id: string;
    id: number;
    idEmployee: number;
    usedDaysApproved: number;
    availableDays: number;
    periodDescription: string;
    totalDaysPeriod: number;
    dateInitPeriod: string;
    dateEndPeriod: string;
    idsVacationsRequest: number[];
}

export type VacationRequestStatus =
    | "APPROVED"
    | "REFUSED"
    | "PENDING"
// | "EMPLOYEE";
