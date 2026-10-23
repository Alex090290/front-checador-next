export type VisitorStatus = "DENTRO" | "SALIO";

export type VisitorStatusFilter = "todos" | "dentro" | "salieron";

export interface IVisitorSignature {
    signedAt: string;
    registeredBy: { id: number; name: string; email: string; sessionType: string } | null;
}

//Una visita = un registro (la misma persona que viene 3 veces son 3 registros)
export interface IVisitor {
    id: number;
    name: string;
    company: string;
    reason: string;
    entryAt: string;
    exitAt: string | null;
    status: VisitorStatus;
    durationMinutes: number | null;
    entrySignature: IVisitorSignature | null;
    exitSignature: IVisitorSignature | null;
    createdAt?: string;
}

export interface IVisitorNameSuggestion {
    name: string;
    lastCompany: string;
    lastVisit: string;
    visits: number;
}

export interface IVisitorCompanySuggestion {
    company: string;
    lastVisit: string;
    visits: number;
}

export interface IVisitorsQuery {
    search?: string;
    status?: VisitorStatusFilter;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
