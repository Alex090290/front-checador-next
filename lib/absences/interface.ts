export interface IAbsence {
    _id?: string;
    id: number;
    idEmployee: number;
    idChecadors: number;
    category: string;
    subCategory: string;
    type: string;
    dateOfAbsence: string;
    createdAt: string;
    updatedAt: string;

    employee?: {
        id: number;
        name: string;
        lastName: string;
    };

    checks: IChecks[];
}

export interface IChecks {
    id: string;
    timestamp: string;
    type: string;
    status: string;
    message: string;
    minutesDifference: number;
    daysdaysBrokenDown: IDaysBrokenDown[];

    coordinates: {
        lat: number;
        lng: number;
    }

    incidents: null;
    createdAt: string;
    checadorId: number;

    user: {
        id: number;
        name: string;
        lastName: string;
        branch: number;
    }
}

interface IDaysBrokenDown {
    id: number;
    year: string;
    fortnightlyPeriod: number;
    day: string;
}