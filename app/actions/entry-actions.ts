"use server";

import { auth } from "@/lib/auth";
import { ActionResponse } from "@/lib/definitions";
import axios, { AxiosResponse } from "axios";

const API_URL = process.env.API_URL;

export async function getWelcome(): Promise<ActionResponse<AxiosResponse>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
      .get(`${API_URL}/welcome`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });

    if (response.status === 403 && response.message === "jwt expired") {
      throw new Error("jwt");
    }

    if (response.status >= 400) {
      throw new Error("NO HAY RESPUESTA DEL SERVIDOR");
    }

    return {
      success: true,
      message: response,
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
