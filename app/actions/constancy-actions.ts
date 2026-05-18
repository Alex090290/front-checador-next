"use server";

import { ActionResponse } from "@/lib/definitions";
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

        await axios
            .post(
                `${API_URL}/constancy`,
                {
                    idEmployee: data.idEmployee,
                    dateTheEvents: data.dateTheEventsscene,
                    hourTheEvents: data.hourTheEvents,
                    sceneOfTheEvents: data.sceneOfTheEvents,
                    backgroundIds: data.backgroundIds,
                    typeOfPenalty: data.typeOfPenalty
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
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
