"use server"

import { FetchUsersArgs } from "@/lib/constancy/interface";
import { IDevices } from "@/lib/devices/interface";
import { storeAction } from "./storeActions";
import axios from "axios";
import { ActionResponse } from "@/lib/definitions";
import { revalidatePath } from "next/cache";



//LISTAR TODOS LOS DISPOSITIVOS
export async function ListDevices(args: FetchUsersArgs & {
    search?: string;
    type?: string;
    status?: string;
    idEmployee?: string;
    idDepartment?: string;
    idBranch?: string;
} = {}): Promise<{
    data: IDevices[];
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
        if (args.type?.trim()) {
            params.set("type", args.type.trim());
        }
        if (args.status?.trim()) {
            params.set("status", args.status.trim());
        }
        if (args.idEmployee !== undefined && !Number.isNaN(Number(args.idEmployee))) {
            params.set("idEmployee", String(args.idEmployee));
        }
        if (args.idDepartment !== undefined && !Number.isNaN(Number(args.idDepartment))) {
            params.set("idDepartment", String(args.idDepartment));
        }
        if (args.idBranch !== undefined && !Number.isNaN(Number(args.idBranch))) {
            params.set("idBranch", String(args.idBranch));
        }
        

        const response = await axios
            .get(`${API_URL}/devices?${params.toString()}`, {
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

//LISTAR UN DISPOSITIVO
export async function ListOneDevice({
  id,
}: {
  id?: number | null;
}): Promise<IDevices | null> {

  try {
    if (!id || id <= 0) return null;

    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/devices/${id}`, {
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

    return response.data?.data ?? response.data ?? null;

  } catch (error) {

    console.log(error);
    return null;
  }
}

//CREAR DISPOSITIVO
export async function createDevice({
  device,
}: {
  device: IDevices;
}): Promise<ActionResponse<IDevices | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios
      .post(
        `${API_URL}/branch`,
        {
            device          
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
        console.log(err);
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    revalidatePath("/app/devices");

    return {
      success: true,
      message: "Dispositivo creado correctamente",
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