"use server"

import { IEmployeeDirectory, IEmployeeDirectoryQuery } from "@/lib/employeeDirectory/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

//Listar directorio de empleados (solo datos de contacto de la empresa)
export async function getEmployeeDirectory(query: IEmployeeDirectoryQuery): Promise<{
    success: boolean;
    message: string;
    data: IEmployeeDirectory[];
    total: number;
    page: number;
    limit: number;
}> {
    const pageNum = Math.max(Number(query.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(query.limit ?? 20) || 20, 1), 100);

    try {
        const { apiToken, API_URL } = await storeAction();

        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.idDepartment) params.set("idDepartment", query.idDepartment);
        if (query.branch) params.set("branch", query.branch);

        const response = await axios
            .get(`${API_URL}/employee-directory?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
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

        let message = "Error en la respuesta";

        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return { success: false, message, data: [], total: 0, page: pageNum, limit: limitNum };
    }
}
