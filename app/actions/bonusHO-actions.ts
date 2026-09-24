"use server"

import { IBonusHomeOffice, IUpdateBonusHO } from "@/lib/Bonus/interface";
import { storeAction } from "./storeActions";
import axios from "axios";
import { ActionResponse } from "@/lib/definitions";
import { revalidatePath } from "next/cache";

//Listar bonos de HO
export async function listAllBonusHO(): Promise<IBonusHomeOffice[]> {

    try {

        const { apiToken, API_URL } = await storeAction();

        const { data } = await axios.get(`${API_URL}/bonushomeoffice/getAll`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        return data.data ?? [];

    } catch (error) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message ?? "Error en la respuesta"
            : "Error inesperado";
        console.log(message, error);
        return [];
    }
}

//Crear bono de HomeOffice
export async function createBonusHomeOffice({
    data
}: {
    data: IBonusHomeOffice;
}): Promise<ActionResponse<IBonusHomeOffice | null>> {

    try {

        const { apiToken, API_URL } = await storeAction();
        await axios
            .post(
                `${API_URL}/bonushomeoffice`,
                {
                    idEmployee: data.idEmployee,
                    amount: Number(data.amount)
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
                }
            );

        revalidatePath("/app/bonushomeoffice");

        return {
            success: true,
            message: "Bono creado correctamente",
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

//Actualizar bono home office 
export async function updateBonusHO({
    idBonus,
    data
}: {
    idBonus: string;
    data: IUpdateBonusHO;
}): Promise<ActionResponse<IUpdateBonusHO | null>> {

    try {
        const { apiToken, API_URL } = await storeAction();

        await axios.put(`${API_URL}/bonushomeoffice/${idBonus}`,
            {
                amount: Number(data.amount)
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/bonushomeoffice");

        return {
            success: true,
            message: "Bono actualizado correctamente",
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

export async function deleteBonusHO({
    idBonus,
}: {
    idBonus: string;
}): Promise<ActionResponse<Boolean>> {

    try {
        const { apiToken, API_URL } = await storeAction();

        await axios.delete(`${API_URL}/bonushomeoffice/${idBonus}`,
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/bonushomeoffice");

        return {
            success: true,
            message: "Bono eliminado correctamente",
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
