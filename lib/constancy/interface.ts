import { ISignatures } from "../overTime/interface";

export type typeOfPenalty = {
    id: number;
    name: string;
}

export type FetchUsersArgs = {
    page?: number;
    limit?: number;
    total?: number;
    //   status?: string;
};

export interface IFiltercUrl {
    idSignatory: number;
}


export interface IInvolvedsEmployes {
    id: number;
    name: string;
    lastName: string;
}
export interface involveds {
    ids: number[];
    employees: IInvolvedsEmployes[];
};

export interface Constancy {
    _id?: string;
    id: number;
    idEmployee: number;
    dateTheEvents: string;
    hourTheEvents: string;
    dateAndTimeOfTheEvents?: string;
    sceneOfTheEvents?: string;
    typeOfPenalty?: typeOfPenalty[];
    backgroundIds?: number[];
    signatures?: ISignatures[];

    employee?: {
        id: number;
        name: string;
        lastName: string;
    };

    backgrounds?: Constancy[];

    witness: number;
    involved?: involveds[];
    tableOfContents?: string;

    discountData?: {
        amount?: number;
        typeDiscount?: string;
    };

    daysWithoutPay?: string[];
}