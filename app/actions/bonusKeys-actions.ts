"use server"

import { IBonusKeys } from "@/lib/Bonus/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

//Listar bonos de llaves 
export async function listAllBonusKeys(): Promise<IBonusKeys[]> {

    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios.get(`${API_URL}/bonuskeys/getAll`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        })
            .then((res) => {
                return res.data;
            })
            .catch((err) => {

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

// //Crear bono
//  export async function createBonusKeys({
//     data
//  }: {
//     data: IBonusKeys;
//  }): Promise<ActionResponse<IBonusKeys | null>>{
//     try{

//          const { apiToken, API_URL } = await storeAction();

//     }catch{

//     }
//  }