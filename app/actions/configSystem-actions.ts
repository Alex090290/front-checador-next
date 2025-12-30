// app/actions/menuActions.ts
"use server";
import axios, { AxiosError } from "axios";
import { storeAction } from "./storeActions";
import { ActionResponse, ConfigSystemUpdate } from "@/lib/definitions";
import { revalidatePath } from "next/cache";

export type IConfigSystem = {
    _id: string,
    permissions: {
        approvalDoh: {
            idPerson: number,
            employee: {
                name: string,
                lastName: string
            }
        },
        approvalLeaders: {
            idPerson: number,
            employee: {
                name: string,
                lastName: string
            }
        }
    },
    vacations: {
        approvalDoh: {
            idPerson: string,
            employee: {
                name: string,
                lastName: string
            }
        },
        approvalLeaders: {
            idPerson: number,
            employee: {
                name: string,
                lastName: string
            }
        }
    }
};

type IResponse = {
  message: string;
  status: number;
  data: IConfigSystem[];
};

export async function getConfigSystem(): Promise<IConfigSystem[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const res = await axios.get<IResponse>(`${API_URL}/configSystem`, {
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

export async function updateConfigSystem(data: ConfigSystemUpdate): Promise<ActionResponse<ConfigSystemUpdate | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const headers = {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }

    await axios.put(`${API_URL}/configSystem`, data, headers).then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    revalidatePath("/app/configSystem");

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
