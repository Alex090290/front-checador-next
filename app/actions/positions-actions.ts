"use server";

import { auth } from "@/lib/auth";
import { ActionResponse } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL;

export async function createPosition({
  namePosition,
  idDepartment,
}: {
  namePosition: string;
  idDepartment: number;
}): Promise<ActionResponse<number | null>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    await axios
      .post(
        `${API_URL}/position`,
        {
          namePosition,
          idDepartment,
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
        console.log("----------POSITIONS ACTIONS ERROR----------");
        console.log(err.response.data);
        return null;
      });

    revalidatePath("/app/departments");

    return {
      success: true,
      message: "Puesto creado",
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

export async function updatePosition({
  id,
  namePosition,
}: {
  id: number;
  namePosition: string;
}): Promise<ActionResponse<boolean>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    await axios
      .put(
        `${API_URL}/position/${String(id)}`,
        {
          namePosition,
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
        console.log(err.response.data);
        return null;
      });

    revalidatePath("/app/departments");

    return {
      success: true,
      message: "Puesto eliminado",
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

export async function deletePosition({
  id,
}: {
  id: number;
}): Promise<ActionResponse<boolean>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    await axios
      .delete(`${API_URL}/position/${String(id)}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err.response.data);
        return null;
      });

    revalidatePath("/app/departments");

    return {
      success: true,
      message: "Puesto eliminado",
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
