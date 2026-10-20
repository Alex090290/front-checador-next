//Estadísticas de toda la empresa para las gráficas del dashboard de administración (solo totales)
export interface ILunchExcessPeriod {
    idPeriod: number;
    numberPeriod: number;
    dateInit: string;
    dateEnd: string;
    totalMinutes: number;
    employees: number;
    times: number;
}

export interface IIncidencesByQuarter {
    quarter: number;
    permissions: number;
    vacations: number;
    inabilities: number;
    overtime: number;
    penalties: number;
    justifiedAbsences: number;
    unjustifiedAbsences: number;
}

export interface ICompanyStatsResponse<T> {
    success: boolean;
    message: string;
    //Sin permiso para ver estadísticas de la empresa: la gráfica se oculta
    forbidden: boolean;
    data: T[];
}
