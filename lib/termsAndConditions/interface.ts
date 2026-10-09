export type TLegalDocumentType = 'TERMINOS' | 'PRIVACIDAD';

export interface ITermsAuthor {
    _id: string;
    email: string;
    name?: string;
}

export interface ITermsAndConditionsVersion {
    version: number;
    title: string;
    content: string;
    updatedAt: string;
    updatedBy?: ITermsAuthor | null;
}

export interface ITermsAndConditions {
    _id?: string;
    id: number;
    type: TLegalDocumentType;
    title: string;
    content?: string;
    version: number;
    isActive: boolean;
    history?: ITermsAndConditionsVersion[];
    createdBy?: ITermsAuthor | null;
    updatedBy?: ITermsAuthor | null;
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ITermsAndConditionsForm {
    type: TLegalDocumentType;
    title: string;
    content: string;
    isActive?: boolean;
}

export const LEGAL_DOCUMENT_LABELS: Record<TLegalDocumentType, string> = {
    TERMINOS: "Términos y condiciones",
    PRIVACIDAD: "Aviso de privacidad",
};

export const TERMS_CONTENT_MAX_LENGTH = 50000;
