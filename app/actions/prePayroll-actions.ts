"use server"

import { IComplete, IGenerateDoc, IPrePayroll, IUpdatePrepayroll } from "@/lib/prePayroll/interface";
import { storeAction } from "./storeActions";
import { FetchUsersArgs } from "@/lib/constancy/interface";
import axios from "axios";
import { ActionResponse } from "@/lib/definitions";
import { revalidatePath } from "next/cache";
import { storeToken } from "@/lib/useToken";

//LISTAR PRENOMINA
export async function listPrePayroll(args: FetchUsersArgs & {
    search?: string;
    idEmployee?: number;
    idPeriod?: string;
    year?: string;
} = {}): Promise<{
    data: IPrePayroll[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    dataExtra: {
        complete: boolean;
        document: {
            id: number;
            whoUploadId: number;
            urlDocument: string;
            createdAt: string;
            updatedAt: string;
        }
    }
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
        const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);



        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));

        if (args.search?.trim()) {
            params.set("search", args.search.trim());
        }
        if (args.idEmployee !== undefined && !Number.isNaN(Number(args.idEmployee))) {
            params.set("idEmployee", String(args.idEmployee));
        }
        if (args.idPeriod?.trim()) {
            params.set("idPeriod", args.idPeriod.trim());
        }
        if (args.year?.trim()) {
            params.set("year", args.year.trim());
        }

        const response = await axios
            .get(`${API_URL}/prePayroll?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(
                    err.response.data.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        const total = Number(response.total ?? 0);
        const pages = Math.max(Math.ceil(total / limitNum), 1);

        return {
            data: response.data ?? [],
            total,
            page: pageNum,
            limit: limitNum,
            pages,
            dataExtra: response.dataExtra
        };

    } catch (error) {
        console.log(error);
        return {
            data: [],
            total: 0,
            page: 1,
            limit: 20,
            pages: 1,
            dataExtra: {
                complete: false,
                document: {
                    id: 0,
                    whoUploadId: 0,
                    urlDocument: "",
                    createdAt: "",
                    updatedAt: "",
                }
            }
        };
    }
}

//ACTUALIZAR PRENOMINA
export async function updatePrepayroll({
    data,
}: {
    data: IUpdatePrepayroll;
}): Promise<ActionResponse<boolean | null>> {

    try {

        const { apiToken, API_URL } = await storeAction();

        await axios.put(
            `${API_URL}/prePayroll`,
            {
                idPeriod: data.idPeriod,
                idUnique: data.idUnique,
                fechaNomina: data.fechaNomina
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        revalidatePath("/app/prePayroll"); //sirve para limpiar la caché de una ruta específica de manera manual y bajo demanda.

        return {
            success: true,
            message: "Actualizado con éxito",
            data: true,
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
            data: null,
        };
    }
}

//COMPLETAR PRENOMINA
export async function completePrepayroll({
    idPrePayRoll,
    data
}: {
    idPrePayRoll: number;
    data: IComplete;
}): Promise<ActionResponse<boolean | null>> {

    try {

        const { apiToken, API_URL } = await storeAction();
        await axios.put(
            `${API_URL}/prePayroll-complete/${idPrePayRoll}`,
            {
                complete: data.complete,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        revalidatePath("/app/prePayroll"); //sirve para limpiar la caché de una ruta específica de manera manual y bajo demanda.

        return {
            success: true,
            message: "Completado con éxito",
            data: true,
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
            data: null,
        };
    }
}

export async function generateDocumentPrenom({
    idPrePayRoll
}: {
    idPrePayRoll: number;
}): Promise<ActionResponse<IGenerateDoc>> {
    try {
        const { apiToken, apiUrl } = await storeToken();

        let base64Url = '';

           await axios.get(`${apiUrl}/generateDocumentprePayroll/${idPrePayRoll}`, {
                headers: { Authorization: `Bearer ${apiToken}` },
            }).then(async () => {
                           await axios.get(`${apiUrl}/documentprePayroll/${idPrePayRoll}`, {
                                headers: { Authorization: `Bearer ${apiToken}` },
                                responseType: "arraybuffer",
                            }).then((res) => {
                                const base64 = Buffer.from(res.data).toString("base64");
                                base64Url = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
                            }).catch((err) => {
                                throw new Error(
                                    err.response?.data?.message
                                        ? err.response.data.message
                                        : "Error al obtener el documento"
                                );
                            });
            }).catch((err) => { 
                throw new Error(
                    err.response?.data?.message
                        ? err.response.data.message
                        : "Error al generar el documento"
                );
            });
        revalidatePath("/app/prePayroll");

        return {
            success: true,
            message: "Documento generado",
            data: { base64Url, idPrePayRoll },
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

export async function downloadDocumentPrenom({
    idPrePayRoll
}: {
    idPrePayRoll: number;
}): Promise<ActionResponse<IGenerateDoc>> {
    try {
        const { apiToken, apiUrl } = await storeToken();

        let base64Url = '';

            await axios.get(`${apiUrl}/documentprePayroll/${idPrePayRoll}`, {
                headers: { Authorization: `Bearer ${apiToken}` },
                responseType: "arraybuffer",
            }).then((res) => {
                const base64 = Buffer.from(res.data).toString("base64");
                base64Url = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
            }).catch((err) => {
                throw new Error(
                    err.response?.data?.message
                        ? err.response.data.message
                        : "Error al obtener el documento"
                );
            });


        revalidatePath("/app/prePayroll");

        return {
            success: true,
            message: "Documento generado",
            data: { base64Url, idPrePayRoll },
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