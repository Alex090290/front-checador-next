// app/actions/menuActions.ts
"use server";
import axios, { AxiosError } from "axios";
import { storeAction } from "./storeActions";
import { ActionResponse, IInability } from "@/lib/definitions";
import { revalidatePath } from "next/cache";



type IResponse = {
  message: string;
  status: number;
  data: IInability[];
};

export interface IResponseInabilityCreate {
  message: string;
  status: number;
  data: {
		id: number,
		idDocument: number,
		acknowledged: boolean,
		insertedId: string
	}
};

export async function getAllInability(): Promise<IInability[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const res = await axios.get<IResponse>(`${API_URL}/inability/all`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    
    return res.data.data ?? [];
  } catch (err: unknown) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    console.log(
      axiosErr.response?.data?.message ?? axiosErr.message ?? "Error"
    );
    return [];
  }
}
export async function getOneInability(id:number): Promise<IInability[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const res = await axios.get<IResponse>(`${API_URL}/inability/one/${id}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    
    return res.data.data ?? [];
  } catch (err: unknown) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    console.log(
      axiosErr.response?.data?.message ?? axiosErr.message ?? "Error"
    );
    return [];
  }
}

export async function createInability(data: IResponseInabilityCreate): Promise<ActionResponse<IResponseInabilityCreate | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const headers = {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }

    await axios.post(`${API_URL}/inability`, data, headers).then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    revalidatePath("/app/inability");

    return {
      success: true,
      message: "Departamento actualizado",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      console.log(error);
      return { success: false, message };
    }

}
