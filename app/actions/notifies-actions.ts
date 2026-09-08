"use server"

import { storeAction } from "./storeActions";
import axios from "axios";
import { ActionResponse } from "@/lib/definitions";
import { INotifications } from "@/lib/notis/interface";

//LISTAR NOTIFICACIONES
export async function ListNotifications(): Promise<INotifications[]> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .get(`${API_URL}/notification-getAll`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })
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

        return response.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error);
        return [];
    }
}

//LEER NOTIFICACION 
export async function ReadNotifications({
    idNotifie,
}: {
    idNotifie: string;
}): Promise<ActionResponse<INotifications | null>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        if (!idNotifie
        ) {
            throw new Error("No se ha definido ID");
        }
        
        await axios
            .put(
                `${API_URL}/notification-read/${idNotifie}`,
                {
                    read: true
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
                    err.response?.data?.message
                        ? Array.isArray(err.response.data.message)
                            ? err.response.data.message.join(", ")
                            : err.response.data.message
                        : "Error en la respuesta"
                );
            });
        // revalidatePath("/app/notifies");


        return {
            success: true,
            message: "Notificación leída",
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