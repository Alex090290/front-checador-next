"use server"

import { IAbsence } from "@/lib/absences/interface";
import { FetchUsersArgs } from "@/lib/constancy/interface";
import { storeAction } from "./storeActions";
import axios from "axios";
import { ActionResponse } from "@/lib/definitions";
import { revalidatePath } from "next/cache";

//Funcio para paginar faltas
export async function fetchAbsencesQueries(args: FetchUsersArgs & {
    search?: string;
    idEmployee?: number;
    dateInit?: string;
    dateEnd?: string;
    type?: string;

} = {}): Promise<{
    data: IAbsence[];
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

        if (args.search?.trim()) {
            params.set("search", args.search.trim());
        }
        if (args.idEmployee !== undefined && !Number.isNaN(Number(args.idEmployee))) {
            params.set("idEmployee", String(args.idEmployee));
        }
        if (args.dateInit) {
            params.set("dateInit", args.dateInit);
        }
        if (args.dateEnd) {
            params.set("dateEnd", args.dateEnd);
        }
        if (args.type) {
            params.set("type", args.type);
        }

        const response = await axios
            .get(`${API_URL}/absencesAndAttendances?${params.toString()}`, {
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

//Funcion para listar todas las faltas
export async function fetchAbsences(): Promise<IAbsence[]> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios.get(`${API_URL}/absencesAndAttendances`, {
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

//Funcion para listar una falta
export async function findAbsence({
    id,
}: {
    id?: number | null;
}): Promise<IAbsence | null> {

    try {
        if (!id || id <= 0) return null;

        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .get(`${API_URL}/absencesAndAttendances/${id}`, {
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

        return response.data?.data ?? response.data ?? null;

    } catch (error) {

        console.log(error);
        return null;
    }
}

//Funcion para eliminar registro de falta
export async function deleteAbsence({
    id,
}: {
    id: number | null;
}): Promise<ActionResponse<boolean>> {
    try {
        if (!id) throw new Error("ID NO ESPECIFICADO");

        const { apiToken, API_URL } = await storeAction();

        await axios.delete(`${API_URL}/absencesAndAttendances/${String(id)}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        revalidatePath("/app/absences");

        return {
            success: true,
            message: "Eliminado exitosamente",
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

//Funcion para actualizar falta
export async function updateAbsence({
    id,
    documents,
    data
}: {
    id: number;
    documents?: IAbsence["documents"];
    data: IAbsence;
}): Promise<
    ActionResponse<
        IAbsence | null>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        if (!id) {
            throw new Error("No se ha definido ID");
        }

        const response = await axios
            .put(
                `${API_URL}/absencesAndAttendances/${id}`,
                {
                    category: data.category,
                    motiveJustify: data.motiveJustify,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
                }
            )
            .then((firstRes) =>
                axios
                    .put(
                        `${API_URL}/absencesAndAttendances/document/${id}`,
                        { documents },
                        {
                            headers: {
                                Authorization: `Bearer ${apiToken}`,
                            },
                        }
                    )
                    .then((secondRes) => ({
                        ...firstRes.data,
                        ...secondRes.data,
                    }))
            )
            .catch((err) => {
                throw new Error(
                    err.response?.data?.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        revalidatePath("/app/absences");

        return {
            success: true,
            message: response.message || "Actualizada correctamente",
            data: response.data || null,
        };
    } catch (error: unknown) {
        const err = error as Error;
        console.log(err);

        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
}
