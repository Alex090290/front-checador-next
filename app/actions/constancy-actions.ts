"use server";

import { ActionResponse, Employee } from "@/lib/definitions";
import { Constancy } from "@/lib/constancy/interface";
import axios from "axios";
import { storeAction } from "./storeActions";
import { revalidatePath } from "next/cache";

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
                dateTheEvents: data.dateTheEventsscene,
                hourTheEvents: data.hourTheEvents,
                sceneOfTheEvents: data.sceneOfTheEvents,
                backgroundIds: data.backgroundIds,
                typeOfPenalty: data.typeOfPenalty,
                signatures: data.signatures,
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
}): Promise<Constancy[] | null> {

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

        return response.data || null;

    } catch (error: any) {

        console.log(error);

        return null;
    }
}

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

