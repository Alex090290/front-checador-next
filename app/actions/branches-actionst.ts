"use server";

import { ActionResponse, Branch } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { storeAction } from "./storeActions";

type FetchUsersArgs = {
  page?: number;
  limit?: number;
  status?: string;
  leader?: number;
  personDoh?: number;
  employee?: number;
};


export async function fetchBranches(): Promise<Branch[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/branch/listAll`, {
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

    return response.data || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}
export async function fetchBranchesQueries(args: FetchUsersArgs = {}): Promise<{
  data: Branch[];
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
      .get(`${API_URL}/branch/listAll?${params.toString()}`, {
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


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
  }
}
export async function findBranchById({
  id,
  _id,
}: {
  id?: number | null;
  _id?: string;
}): Promise<Branch | null> {
  try {
    const { apiToken, API_URL } = await storeAction();

    let params = {};

    if (_id) params = { idMongo: String(_id) };
    if (id) params = { id: Number(id) };

    const response = await axios
      .get(`${API_URL}/branch/listOne`, {
        params,
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

    return response.data || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createBranch({
  branch,
}: {
  branch: Branch;
}): Promise<ActionResponse<Branch | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios
      .post(
        `${API_URL}/branch`,
        {
          name: branch.name,
          street: branch.street,
          numberIn: branch.numberIn,
          numberOut: branch.numberOut,
          state: branch.state,
          country: branch.country,
          neighborhood: branch.neighborhood,
          municipality: branch.municipality,
          zipCode: branch.zipCode,
          lat: branch.lat,
          lng: branch.lng,
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

    revalidatePath("/app/branches");

    return {
      success: true,
      message: "Sucursal creada",
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

export async function updateBranch({
  id,
  branch,
}: {
  id: number;
  branch: Branch;
}): Promise<ActionResponse<boolean | null>> {
  try {
    if (!id) throw new Error("ID NO ESPECIFICADO");

    const { apiToken, API_URL } = await storeAction();

    await axios.put(
      `${API_URL}/branch/${String(id)}`,
      {
        name: branch.name,
        street: branch.street,
        numberIn: branch.numberIn,
        numberOut: branch.numberOut,
        state: branch.state,
        country: branch.country,
        neighborhood: branch.neighborhood,
        municipality: branch.municipality,
        zipCode: branch.zipCode,
        lat: branch.lat,
        lng: branch.lng,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    revalidatePath("/app/branches");

    return {
      success: true,
      message: "Sucursal actualizada",
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

export async function deleteBranch({
  id,
}: {
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    if (!id) throw new Error("ID NO ESPECIFICADO");

    const { apiToken, API_URL } = await storeAction();

    await axios.delete(`${API_URL}/branch/${String(id)}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    revalidatePath("/app/branches");

    return {
      success: true,
      message: "Sucursal eliminada",
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