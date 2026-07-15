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
}