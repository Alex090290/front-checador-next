"use server"

import { IParticipationEmployee, IParticipationQuery } from "@/lib/reportsParticipation/interface";
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

//Listar empleados activos con su participación en reportes
export async function getReportsParticipation(query: IParticipationQuery): Promise<{
    success: boolean;
    message: string;
    data: IParticipationEmployee[];
    total: number;
    page: number;
    limit: number;
}> {
    const pageNum = Math.max(Number(query.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(query.limit ?? 50) || 50, 1), 500);

    try {
        const { apiToken, API_URL } = await storeAction();

        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.idDepartment) params.set("idDepartment", query.idDepartment);
        if (query.branch) params.set("branch", query.branch);
        if (query.participation && query.participation !== "todos") params.set("participation", query.participation);

        const response = await axios
            .get(`${API_URL}/employee-participation?${params.toString()}`, {
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

//Incluir (desde una fecha) o excluir de los reportes a uno o varios empleados
export async function updateReportsParticipation({
    ids,
    active,
    since,
}: {
    ids: number[];
    active: boolean;
    since?: string;
}): Promise<{ success: boolean; message: string; notFound: number[] }> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .put(
                `${API_URL}/employee-participation`,
                {
                    ids,
                    active,
                    ...(active && since ? { since } : {}),
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
            message: response?.message ?? "Participación actualizada",
            notFound: response?.data?.notFound ?? [],
        };
    } catch (error: unknown) {
        console.log(error);
        const notFound = axios.isAxiosError(error) ? error.response?.data?.data?.notFound ?? [] : [];
        return { success: false, message: getErrorMessage(error), notFound };
    }
}
