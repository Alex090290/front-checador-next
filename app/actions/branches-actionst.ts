"use server";

import { ActionResponse, Branch } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { storeAction } from "./storeActions";

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
