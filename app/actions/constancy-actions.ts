"use server";

import { ActionResponse } from "@/lib/definitions";
import { Constancy, FetchUsersArgs, typeOfPenalty } from "@/lib/constancy/interface";
import axios from "axios";
import { storeAction } from "./storeActions";
import { revalidatePath } from "next/cache";
import { base64ToBlob } from "@/lib/helpers";
import { storeToken } from "@/lib/useToken";


//Listar contancias 
export async function fetchConstancies(): Promise<Constancy[]> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios.get(`${API_URL}/constancyAll`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        })
            .then((res) => {
                console.log("Respuesta correcta: ", res.data)
                return res.data;
            })
            .catch((err) => {
                console.log("Respuestas incorrecta: ", err);

                throw new Error(
                    err.response.message
                        ? err.response?.data?.message
                        : "Error en la respuesta"
                );
            });
        return response.data || [];

    } catch (error) {
        console.log(error);
        return [];
    }
}

//Listar tipo de penalizacion 
export async function fetchPenalties(): Promise<typeOfPenalty[]> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios.get(`${API_URL}/constancy/typePenalty`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        console.log("Respuesta correcta: ", response.data);

        return response.data?.data || [];

    } catch (error: unknown) {
        const err = error as Error;
        console.log(err);
    
        return []
      }
}

//Funcion para paginar constancias 
export async function fetchConstanciesQueries(args: FetchUsersArgs = {}): Promise<{
    data: Constancy[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
        const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);

        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));

        const response = await axios
            .get(`${API_URL}/constancyAll?${params.toString()}`, {
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
        };

    } catch (error) {
        console.log(error);
        return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
    }
}

//Funcion para crear una constancia 
export async function createConstancy({
    data,
}: {
    data: Constancy;
}): Promise<ActionResponse<Constancy>> {

    try {
        const { apiToken, API_URL } = await storeAction();
        await axios.post(`${API_URL}/constancy`,
                {
                    idEmployee: data.idEmployee,
                    dateTheEvents: data.dateTheEvents,
                    hourTheEvents: data.hourTheEvents,
                    sceneOfTheEvents: data.sceneOfTheEvents,
                    backgroundIds: data.backgroundIds ?? [],
                    typeOfPenalty: data.typeOfPenalty,
                    witness: data.witness,
                    daysWithoutPay: data.daysWithoutPay ?? [],
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
                }
            ).then((res) => {
                console.log("Respuesta correcta: ", res.data);

                return res.data;
            }).catch((err) => {
                console.log("Respuesta incorrecta: ", err);

                throw new Error(
                    err.response.data.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        revalidatePath("/app/constancy");

        return {
            success: true,
            message: "Constancia creada correctamente "
        };
    } catch (error: unknown) {
        const err = error as Error;

        return {
            success: false,
            message: err.message,
        };
    }
}

//Funcion para buscar una constancia por id de empleado 
export async function findConstancyByIdEmployee({
    idEmployee,
}: {
    idEmployee?: number | null;
}): Promise<Constancy[]> {
    try {
        if (!idEmployee || idEmployee <= 0) return [];

        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .get(`${API_URL}/constancyAll`, {
                params: {
                    idEmployee: Number(idEmployee),
                },
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })
            .then((res) => {
                console.log("Respuesta correcta: ", res.data);
                return res.data;
            })
            .catch((err) => {
                console.log("Respuesta incorrecta: ", err);

                throw new Error(
                    err.response.data.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        return response.data ?? [];
    } catch (error) {
        console.log(error);
        return [];
    }
}

//Funcion para buscar una constancia por id de constancia
export async function findConstancyById({
    id,
}: {
    id?: number | null;
}): Promise<Constancy | null> {

    try {
        if (!id || id <= 0) return null;

        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .get(`${API_URL}/constancy/${id}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })

            .then((res) => {
                console.log("Respuesta correcta: ", res.data);
                return res.data;
            })

            .catch((err) => {
                console.log("Respuesta incorrecta: ", err);

                throw new Error(
                    err.response.data.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        console.log("URL:", `${API_URL}/constancy/${id}`);
        console.log("RESPUESTA CONSTANCY BY ID:", response);

        return response.data?.data ?? response.data ?? null;

    } catch (error) {

        console.log(error);
        return null;
    }
}

export async function updateConstancy({
    id,
    constancy,
}: {
    id: number;
    constancy: Constancy;
}): Promise<ActionResponse<boolean | null>> {

    try {
        if (!id) throw new Error("ID NO ESPECIFICADO");

        const { apiToken, API_URL } = await storeAction();
        await axios.put(
            `${API_URL}/constancy/${String(id)}`,
            {
                idEmployee: constancy.idEmployee,
                dateTheEvents: constancy.dateTheEvents,
                hourTheEvents: constancy.hourTheEvents,
                sceneOfTheEvents: constancy.sceneOfTheEvents,
                backgroundIds: constancy.backgroundIds ?? [],
                typeOfPenalty: constancy.typeOfPenalty ?? [],
                witness: constancy.witness,
                daysWithoutPay: constancy.daysWithoutPay ?? [],
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        revalidatePath("/app/constancy");

        return {
            success: true,
            message: "Constancia actualizada",
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

export async function deleteConstancy({
    id,
}: {
    id: number | null;
}): Promise<ActionResponse<boolean>> {
    try {
        if (!id) throw new Error("ID NO ESPECIFICADO");

        const { apiToken, API_URL } = await storeAction();

        await axios.delete(`${API_URL}/constancy/${String(id)}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        revalidatePath("/app/constancy");

        return {
            success: true,
            message: "Constancia eliminada",
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

//Post de firmas
export async function sendSignature({
    data,
}: {
    data: {
        id: string | null;
        signature: string;
    };
}): Promise<ActionResponse<boolean>> {
    try {
        if (!data.id) throw new Error("ID NOT DEFINED");
        if (!data.signature) throw new Error("No se recibió la firma");

        const { apiToken, apiUrl } = await storeToken();

        const formData = new FormData();

        const blob = base64ToBlob(data.signature, "image/png");

        formData.append("img", blob, "signature.png");

        await axios.post(`${apiUrl}/constancy/signature/${data.id}`, formData, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        return {
            success: true,
            message: "Firma enviada correctamente",
            data: true,
        };
    } catch (error: unknown) {
        const err = error as Error;

        return {
            success: false,
            message: err.message ? err.message : "Error al obtener información",
            data: false,
        };
    }
}

//Obtener firma del empleado
export async function fetchSignatureConstancy({
    id,
    idEmployee,
}: {
    id: number | null;
    idEmployee: string | null;
}): Promise<ActionResponse<string>> {
    try {
        const { apiToken, apiUrl } = await storeToken();

        // Obtener imagen en binario
        const resImg = await axios
            .get(
                `${apiUrl}/constancy/signature/${id}/${idEmployee}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
                    responseType: "arraybuffer",
                }
            )
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                throw new Error(
                    err.response.data.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        // Convertir a base64
        const base64 = Buffer.from(resImg, "binary").toString("base64");
        const imageBase64Url = `data:image/jpeg;base64,${base64}`;

        return {
            success: true,
            message: "Imagen subida correctamente",
            data: imageBase64Url,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: error.message,
        };
    }
}



