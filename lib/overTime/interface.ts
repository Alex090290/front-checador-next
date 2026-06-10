export interface OverTime {
    _id?: string;
    id: number
    idEmployee: number;
    motive: string;
    date: string;
    hourInit: string;
    hourEnd: string;
    status: OvertimeRequestStatus;
    informationDate?: informationDate; 
    createdAt?: string;
    incidence?: string;
    signatures?: signatures[];


    createForPerson?: {
        _id: string;
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

    leaderApproval: OvertimeRequestStatus;
    dohApproval: OvertimeRequestStatus;
}

export interface OverTimeAxios {
    _id?: string;
    id: number
}

export type OvertimeRequestStatus =
    | "APPROVED"
    | "REFUSED"
    | "PENDING"


export type TInputsOvertime = {
    motive: string;
    idEmployee: number | null;
    idLeader?: number | null;
    idPersonDoh?: number | null;
    date: string;
    hourInit: string;
    hourEnd: string;
    signature?: string;
};

type informationDate = {
    _id: string;
    id: number;
    totalHours: number;
    dateInit: string;
    dateEnd: string;
    hourInit: string;
    hourEnd: string; 
}

export interface signatures {
    id: number;
    idSignatory: number;
    name: string;
    url: string;
    sendNotify: boolean;
    signature?: string;
}