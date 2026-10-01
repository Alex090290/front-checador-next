export interface IGroceryVouchers {
    idEmployee: number;
    name: string;
    lastName: string;
    idCheck: number
    status: number
    uiid: string;
    dailyBreakdown: {
        _id?: string;
        id: number;
        idEmployee: number;
        createFor: null,
        idChecadors: number[];
        category: string | null;
        subCategory: string;
        type: string;
        documents: null | [],
        motiveJustify: string;
        dateOfAbsence: string;
        createdAt: string;
        updatedAt: string;
        amountPayment: number;
    }[],

    dailyBreakdownDiscount: {
        _id?: string;
        id: number;
        idEmployee: number;
        createFor: null;
        idChecadors: number[];
        category: string;
        subCategory: string;
        type: string;
        documents: null | [];
        motiveJustify: string;
        idPenalty: null;
        dateOfAbsence: string;
        createdAt: string;
        updatedAt: string;
        discount: number;
    }[],

    daysPendingVerification: {
        date: string;
        verified: boolean;
        discountAmount: number | null;
        amountPayment: number;
    }[],

    sumPaymentPositive: number;
    totalDiscount: number;
    amountPaymentTotal: number;
}