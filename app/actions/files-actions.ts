"use server"

import { ActionResponse } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";

export async function getFirstDocument({
    dateInit,
    dateEnd,
}: {
    dateInit: string;
    dateEnd: string;
}): Promise<ActionResponse<{ base64Url: string; fileName: string } | null>> {
    try {
        const { apiToken, API_URL } = await storeAction();


        const params = new URLSearchParams();
        params.set("dateInit", dateInit);
        params.set("dateEnd", dateEnd);

        let base64Url = "";

        await axios
            .get(`${API_URL}/absencesAndAttendances-report-document?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
                responseType: "arraybuffer",
            })
            .then((res) => {
                const base64 = Buffer.from(res.data).toString("base64");
                base64Url = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
            })
            .catch((err) => {
                throw new Error(
                    err.response?.data?.message
                        ? err.response.data.message
                        : "Error al generar el reporte"
                );
            });

        return {
            success: true,
            message: "Reporte generado",
            data: {
                base64Url,
                fileName: `reporte_${dateInit}_a_${dateEnd}.xlsx`,
            },
        };
    } catch (error: unknown) {
        console.log(error);

        let message = "Error en la respuesta";

        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return {
            success: false,
            message,
        };
    }
}