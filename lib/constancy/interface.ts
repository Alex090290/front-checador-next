export interface Constancy {
    _id?: string;
    idEmployee: number;
    dateTheEventsscene: string;
    hourTheEvents: string;
    sceneOfTheEvents: string;
    backgroundIds: number[];
    typeOfPenalty: typeOfPenalty[];
}

export interface typeOfPenalty {
    _id: string;
    id: number;
    name: string;
}