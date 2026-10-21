"use server"

import { CheckMethods, IChecador, IChecadoresQuery } from "@/lib/checadores/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

function getErrorMessage(error: unknown) {
    let message = "Error en la respuesta";

    if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return message;
}

//Listar los equipos checador (usuarios con rol CHECADOR) con su tipo de validación
export async function getChecadores(query: IChecadoresQuery): Promise<{
    success: boolean;
    message: string;
    data: IChecador[];
    total: number;
    page: number;
    limit: number;
}> {
    const pageNum = Math.max(Number(query.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(query.limit ?? 50) || 50, 1), 100);

    try {
        const { apiToken, API_URL } = await storeAction();

        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.branch) params.set("branch", query.branch);
        if (query.status) params.set("status", query.status);
        if (query.checkMethods) params.set("checkMethods", query.checkMethods);

        const response = await axios
            .get(`${API_URL}/checadores?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
                timeout: 15000,
            })
            .then((res) => res.data);

        return {
            success: true,
            message: response?.message ?? "OK",
            data: response?.data ?? [],
            total: Number(response?.total ?? 0),
            page: Number(response?.page ?? pageNum),
            limit: Number(response?.limit ?? limitNum),
        };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, message: getErrorMessage(error), data: [], total: 0, page: pageNum, limit: limitNum };
    }
}

//Cambiar el tipo de validación de un checador (aplica desde su siguiente checada)
export async function updateCheckMethods(id: number, checkMethods: CheckMethods): Promise<{
    success: boolean;
    message: string;
    data?: { id: number; checkMethods: CheckMethods; checkMethodsUpdatedAt: string | null };
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .put(`${API_URL}/checadores/${id}/check-methods`, { checkMethods }, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
                timeout: 15000,
            })
            .then((res) => res.data);

        return {
            success: true,
            message: response?.message ?? "Tipo de validación actualizado",
            data: response?.data,
        };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, message: getErrorMessage(error) };
    }
}
