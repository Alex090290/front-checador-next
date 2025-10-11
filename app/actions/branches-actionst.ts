"use server";

import { auth } from "@/lib/auth";
import { ActionResponse, Branch } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL;

export async function fetchBranches(): Promise<Branch[]> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

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
        return err.response;
      });

    return response.data.data;

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
    const session = await auth();
    const apiToken = session?.user?.apiToken;

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
        return err.response;
      });

    return response.data.data;

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
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
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
        return err.response;
      });

    if (response.data.status === 400) {
      throw new Error(response.data.message);
    }

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
