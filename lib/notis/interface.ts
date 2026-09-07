export interface INotifies {
    _id?: string;
    idIncidence: number;
    idSign: number;
    idSignatory: number;
    incidenceRef: string;
    signatureLabel: string;
    title: string;
    message: string;
    status: string;
    url: string;
    readAt: string | null;
    createdA: string | null;
    updatedAt: string | null;

    read?: boolean;
}

