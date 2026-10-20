export type PendingCheckStatus = 'PENDIENTE' | 'VALIDADA' | 'RECHAZADA';

export type PendingCheckStatusFilter = PendingCheckStatus | 'TODOS';

export interface IPendingCheckReview {
    idUser: number | null;
    idEmployee: number | null;
    email: string;
    name: string;
    notes: string;
    reviewedAt: string;
}

//Checada sin conexión que llegó más de 1 hora tarde y espera validación de DOH
export interface IPendingCheck {
    id: number;
    idEmployee: number;
    idCheck: number;
    idUser: number;
    eventTime: string;
    receivedAt: string;
    minutesLate: number;
    coordinates: { lat: number; lng: number };
    status: PendingCheckStatus;
    review: IPendingCheckReview | null;
    employee?: { id: number; idCheck: number; name: string; lastName: string; picture?: string; idDepartment: number };
    department?: { id: number; nameDepartment: string };
    checador?: { id: number; name: string; email: string };
}
