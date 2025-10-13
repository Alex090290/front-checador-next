"use server";

import { auth } from "@/lib/auth";
import { ActionResponse, Position } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL;

export async function fetchPositions(): Promise<ActionResponse<Position[]>> {
  const response = await axios
    .get(`${API_URL}/`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err.response;
    });

  return response.data ?? [];
}

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

    const response = await axios
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
        return err.response;
      });

    if (response.data.status === 400) {
      throw new Error(response.data.message);
    }

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
}: {
  id: number;
}): Promise<ActionResponse<boolean>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    const response = await axios
      .delete(`${API_URL}/position/${String(id)}`, {
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

    console.log(response.data);

    if (response.data?.status === 400) {
      throw new Error(response.data.message);
    }

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

    const response = await axios
      .delete(`${API_URL}/position/${String(id)}`, {
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

    console.log(response.data);

    if (response.data?.status === 400) {
      throw new Error(response.data.message);
    }

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
