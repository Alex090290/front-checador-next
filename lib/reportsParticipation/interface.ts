export type ParticipationFilter = 'todos' | 'participa' | 'no_participa';

export interface IReportsParticipation {
    active: boolean;
    since: string | null;
    updatedAt: string;
    updatedBy: { idUser: number | null; idEmployee: number | null; email: string; name: string };
}

//Empleado activo con su participación en los cálculos de reportes (faltas automáticas, prenómina, vales, bonos)
export interface IParticipationEmployee {
    id: number;
    idCheck: number;
    name: string;
    lastName: string;
    picture?: string;
    department?: { id: number; nameDepartment: string };
    position?: { id: number; namePosition: string };
    branch?: { id: number; name: string };
    participatesToday: boolean;
    reportsParticipation: IReportsParticipation | null;
}

export interface IParticipationQuery {
    search?: string;
    idDepartment?: string;
    branch?: string;
    participation?: ParticipationFilter;
    page?: number;
    limit?: number;
}
