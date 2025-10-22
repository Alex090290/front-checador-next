"use server";

import { ActionResponse, ICheckInFeedback } from "@/lib/definitions";
import { storeToken } from "@/lib/useToken";
import axios, { AxiosResponse } from "axios";

export async function getWelcome(): Promise<ActionResponse<AxiosResponse>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    const response = await axios
      .get(`${apiUrl}/welcome`, {
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

export async function checkIn({
  idCheck,
  passwordCheck,
  lat,
  lng,
}: {
  idCheck: string;
  passwordCheck: string;
  lat: number;
  lng: number;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    await axios
      .post(
        `${apiUrl}/checador`,
        {
          idCheck: Number(idCheck),
          passwordCheck: Number(passwordCheck),
          lat,
          lng,
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
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    return {
      success: true,
      message: "REGISTRO CORRECTO",
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

export async function fetchCheckInFeedback(): Promise<
  ActionResponse<ICheckInFeedback[]>
> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    const response = await axios
      .get(`${apiUrl}/checador/view`, {
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

    return {
      success: true,
      message: response.message,
      data: response.data,
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
