"use server";

import { auth } from "@/lib/auth";
import { Permission } from "@/lib/definitions";
import axios from "axios";

const API_URL = process.env.API_URL;

export async function fetchPermissions(): Promise<Permission[]> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
      .get(`${API_URL}/permissions`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err.response);
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error al descargar el PDF"
        );
      });

    if (response.data.status === 401) {
      throw new Error("Acceso denegado (401)");
    }

    return response.data[0].permissions ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}
