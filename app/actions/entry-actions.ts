"use server";

import { ActionResponse, ICheckInFeedback } from "@/lib/definitions";
import { storeToken } from "@/lib/useToken";
import axios, { AxiosResponse } from "axios";
import { redirect } from "next/navigation";

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
        return err?.response?.data;
      });

    if (
      response?.status === 401 ||
      (response?.status === 403 && response?.message === "jwt expired")
    ) {
      redirect("/auth");
    }

    if (response?.status >= 400) {
      throw new Error(response?.message || "NO HAY RESPUESTA DEL SERVIDOR");
    }

    return {
      success: true,
      message: response,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.log(err);

    return {
      success: false,
      message: err.message,
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
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    const response = await axios
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
        if (
          err?.response?.status === 401 ||
          (err?.response?.status === 403 &&
            err?.response?.data?.message === "jwt expired")
        ) {
          redirect("/auth");
        }

        throw new Error(
          err?.response?.data?.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    return {
      success: true,
      message: "REGISTRO CORRECTO",
      data: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.log(err);

    return {
      success: false,
      message: err.message,
    };
  }
}

export async function fetchCheckInFeedback(): Promise<
  ActionResponse<ICheckInFeedback[]>
> {
  try {
    const { apiToken, apiUrl, user } = await storeToken();

    let url = `${apiUrl}/checador/view`;

    if (user?.role === "CHECADOR") url += `?idUser=${user.id}`;

    const response = await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        if (
          err?.response?.status === 401 ||
          (err?.response?.status === 403 &&
            err?.response?.data?.message === "jwt expired")
        ) {
          redirect("/auth");
        }

        throw new Error(
          err?.response?.data?.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.log(err);

    return {
      success: false,
      message: err.message,
    };
  }
}