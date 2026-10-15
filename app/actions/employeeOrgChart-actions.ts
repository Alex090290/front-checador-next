"use server"

import { IOrgNode } from "@/lib/orgChart/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

//Organigrama: lista plana de nodos (cada uno apunta a su padre). idDepartment = solo la rama de ese departamento
export async function getEmployeeOrgChart(idDepartment?: string): Promise<{
    success: boolean;
    message: string;
    data: IOrgNode[];
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const params = new URLSearchParams();
        if (idDepartment) params.set("idDepartment", idDepartment);
        const query = params.toString();

        const response = await axios
            .get(`${API_URL}/employee-orgchart${query ? `?${query}` : ""}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })
            .then((res) => res.data);

        return {
            success: true,
            message: response?.message ?? "OK",
            data: response?.data ?? [],
        };
    } catch (error: unknown) {
        console.log(error);

        let message = "Error en la respuesta";

        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return { success: false, message, data: [] };
    }
}
