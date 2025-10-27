"use server";

import { ActionResponse, ICheckInFeedback } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";

export async function fetchEventos(): Promise<ICheckInFeedback[]> {
  try {
    const { API_URL, apiToken } = await storeAction();
    const response = await axios
      .get(`${API_URL}/checador/view`, {
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

    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

export async function fetchChecadorTypes(): Promise<string[]> {
  try {
    const { API_URL, apiToken } = await storeAction();
    const response = await axios
      .get(`${API_URL}/checador/listTypes`, {
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
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

export async function fetchChecadorStatus(): Promise<string[]> {
  try {
    const { API_URL, apiToken } = await storeAction();
    const response = await axios
      .get(`${API_URL}/checador/listStatus`, {
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
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

export async function updateRegristrosChecador({
  idRegistro,
  idCheck,
  type,
  status,
}: {
  idRegistro: number | null;
  idCheck: number | null;
  type: string;
  status: string;
}): Promise<ActionResponse<boolean>> {
  try {
    const { API_URL, apiToken } = await storeAction();
    if (!idCheck && idRegistro) throw new Error("ID NOT DEFINED");
    await axios
      .put(
        `${API_URL}/checador/${idRegistro}/${idCheck}`,
        {
          type,
          status,
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

    // revalidatePath("/app/eventos");

    return {
      success: true,
      message: "Se ha modificado el registro",
      data: true,
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

export async function searchEventosParams({
  date,
  idEmployee,
  idUser,
}: {
  date: string | null;
  idEmployee: number | null;
  idUser: number | null;
}): Promise<ICheckInFeedback[]> {
  try {
    const { API_URL, apiToken } = await storeAction();

    const params = {
      ...(date ? { date } : {}),
      ...(idEmployee ? { idEmployee } : {}),
      ...(idUser ? { idUser } : {}),
    };

    const response = await axios
      .get(`${API_URL}/checador/view`, {
        params,
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
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}
