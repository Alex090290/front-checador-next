"use server"

import { ICompanyStatsResponse, IIncidencesByQuarter, ILunchExcessPeriod } from "@/lib/statisticsCompany/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

async function getCompanyStats<T>(path: string, params: Record<string, string>): Promise<ICompanyStatsResponse<T>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const query = new URLSearchParams(params).toString();

        const response = await axios
            .get(`${API_URL}/statistics-company/${path}?${query}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
                timeout: 15000,
            })
            .then((res) => res.data);

        return {
            success: true,
            message: response?.message ?? "OK",
            forbidden: false,
            data: Array.isArray(response?.data) ? response.data : [],
        };
    } catch (error: unknown) {
        console.log(error);

        let message = "Error en la respuesta";

        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        // El back responde 400 también por permisos; se distingue por su mensaje
        const forbidden = /permiso/i.test(message);

        return { success: false, message, forbidden, data: [] };
    }
}

//Exceso de tiempo de comida por periodo del trimestre
export async function getLunchExcess(year: number, quarter: number): Promise<ICompanyStatsResponse<ILunchExcessPeriod>> {
    return getCompanyStats<ILunchExcessPeriod>("lunch-excess", { year: String(year), quarter: String(quarter) });
}

//Incidencias del año por trimestre (los 7 tipos de "Incidencias del año")
export async function getIncidencesByQuarter(year: number): Promise<ICompanyStatsResponse<IIncidencesByQuarter>> {
    return getCompanyStats<IIncidencesByQuarter>("incidences-by-quarter", { year: String(year) });
}
