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

export interface Constancy {
    signature: string;
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
}