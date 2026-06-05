export interface OverTime {
    _id?: string;
    id: number
    idEmployee: number;
    motive: string;
    date: string;
    hourInit: string;
    hourEnd: string;

    employee?: {
        _id?: string;
        id: number;
        name: string;
        lastName: string;
    }
}