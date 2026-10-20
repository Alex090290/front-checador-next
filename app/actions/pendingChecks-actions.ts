"use server"

import { IPendingCheck, PendingCheckStatus, PendingCheckStatusFilter } from "@/lib/pendingChecks/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

function getErrorInfo(error: unknown): { message: string; status: number | null } {
    let message = "Error en la respuesta";
    let status: number | null = null;

    if (axios.isAxiosError(error)) {
        status = error.response?.status ?? null;
        message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return { message, status };
}

//Bandeja de checadas sin conexión que llegaron tarde (solo DOH)
export async function fetchPendingChecks(args: {
    status?: PendingCheckStatusFilter;
    idEmployee?: string;
    search?: string;
    page?: number;
    limit?: number;
} = {}): Promise<{
    success: boolean;
    message: string;
    statusCode: number | null;
    data: IPendingCheck[];
    total: number;
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
        const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);

        const params = new URLSearchParams();
        params.set("status", args.status ?? "PENDIENTE");
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));
        if (args.idEmployee?.trim()) params.set("idEmployee", args.idEmployee.trim());
        if (args.search?.trim()) params.set("search", args.search.trim());

        const response = await axios
            .get(`${API_URL}/checador/pending-checks?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
                timeout: 15000,
            })
            .then((res) => res.data);

        return {
            success: true,
            message: response?.message ?? "OK",
            statusCode: response?.status ?? 200,
            data: response?.data ?? [],
            total: Number(response?.total ?? 0),
        };
    } catch (error: unknown) {
        console.log(error);
        const { message, status } = getErrorInfo(error);
        return { success: false, message, statusCode: status, data: [], total: 0 };
    }
}

//Validar o rechazar. 409 = alguien más ya la revisó
export async function reviewPendingCheck({
    id,
    status,
    notes,
}: {
    id: number;
    status: Exclude<PendingCheckStatus, "PENDIENTE">;
    notes: string;
}): Promise<{ success: boolean; message: string; statusCode: number | null }> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const cleanNotes = notes.trim();

        const response = await axios
            .put(
                `${API_URL}/checador/pending-checks/${id}`,
                {
                    status,
                    ...(cleanNotes ? { notes: cleanNotes } : {}),
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
                    timeout: 15000,
                }
            )
            .then((res) => res.data);

        return {
            success: true,
            message: response?.message ?? "Checada revisada",
            statusCode: response?.status ?? 200,
        };
    } catch (error: unknown) {
        console.log(error);
        const { message, status } = getErrorInfo(error);
        return { success: false, message, statusCode: status };
    }
}
