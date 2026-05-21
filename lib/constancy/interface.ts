//Alias para valores predeterminados de backgroundIds
type backgroundIdsPermitidos = 1 | 2 | 3 ;

//Arreglo para penalizaciones
export interface typeOfPenalty {
    id: number;
    name: string;
}

//Arreglo para firmas
export interface signatures {
    id: number;
    idSignatory: number;
    name: string;
    url: string;
    sendNotify: boolean;
}

export interface Constancy {
    _id?: string;
    id: number;
    idEmployee: number;
    dateAndTimeOfTheEvents?: string,
    dateTheEventsscene: string;
    hourTheEvents: string;
    sceneOfTheEvents: string;
    backgroundIds: backgroundIdsPermitidos[];
    typeOfPenalty: typeOfPenalty[];
    signatures: signatures[];
}

