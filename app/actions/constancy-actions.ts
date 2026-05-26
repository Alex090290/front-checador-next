"use server";

import { ActionResponse } from "@/lib/definitions";
import { Constancy } from "@/lib/constancy/interface";
import axios from "axios";
import { storeAction } from "./storeActions";
import { revalidatePath } from "next/cache";


type FetchUsersArgs = {
    page?: number;
    limit?: number;
    //   status?: string;
};

//Listar contancias 
export async function fetchConstancies(p0: { page: number; limit: number; }): Promise<Constancy[]> {
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
                        ? err.respone.data.message
                        : "Error en la respuesta"
                );
            });
        return response.data || [];

    } catch (error: any) {
        console.log(error);
        return [];
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

    } catch (error: any) {
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

        console.log("Data: ", data);

        await axios.post(`${API_URL}/constancy`,
            {
                idEmployee: data.idEmployee,
                dateTheEvents: data.dateTheEvents,
                hourTheEvents: data.hourTheEvents,
                sceneOfTheEvents: data.sceneOfTheEvents,
                // backgrounds: data.backgrounds,
                backgroundIds: data.backgroundIds ?? [],
                typeOfPenalty: data.typeOfPenalty,
                witness: data.witness,
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
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: error.message,
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
    } catch (error: any) {
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

    } catch (error: any) {

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
                id: constancy.id,
                idEmployee: constancy.idEmployee,
                dateTheEvents: constancy.dateTheEvents,
                hourTheEvents: constancy.hourTheEvents,
                sceneOfTheEvents: constancy.sceneOfTheEvents,
                backgrounds: constancy.backgrounds,
                typeOfPenalty: constancy.typeOfPenalty,
                witness: constancy.witness
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



