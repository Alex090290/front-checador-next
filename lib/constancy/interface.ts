import { Employee } from "../definitions";

export type typeOfPenalty = {
        id: number;
        name: string;
    }

export type signatures = {
    id: number;
    idSignatory: number;
    name: string;
    url: string;
    sendNotify: boolean;
    signature?: string;
}

export type involveds = {
  ids: number[];
  employees: {
    id: number;
    name: string;
    lastName: string;
  }[];
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
    signatures?: signatures[];

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