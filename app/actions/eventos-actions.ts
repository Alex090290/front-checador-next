"use server";

import { ActionResponse, AttendanceReportItem, ICheckInFeedback } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";

type FetchArgs = {
  idPeriod?: number;
  page?: number;
  limit?: number;
};

export async function fetchEventos(): Promise<ICheckInFeedback[]> {
  try {
    const { API_URL, apiToken, session } = await storeAction();

    let url = `${API_URL}/checador/view`;

    if (session?.role === "CHECADOR") url += `?idUser=${session?.id}`;

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
  dateHour,
  minutesDifference,
}: {
  idRegistro: number | null;
  idCheck: number | null;
  type: string;
  status: string;
  dateHour: string;
  minutesDifference: number;
}): Promise<ActionResponse<boolean>> {
  try {
    const { API_URL, apiToken } = await storeAction();
    if (!idCheck && idRegistro) throw new Error("ID NOT DEFINED");

    const body = {
      type,
      status,
      date: dateHour.split("T")[0],
      hour: dateHour.split("T")[1],
      minutesDifference,
    };

    await axios
      .put(`${API_URL}/checador/${idRegistro}/${idCheck}`, body, {
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

export async function deleteRegristrosChecador({
  idRegistro,
  idCheck
}: {
  idRegistro: number | null;
  idCheck: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    const { API_URL, apiToken } = await storeAction();
    if (!idCheck && idRegistro) throw new Error("ID NOT DEFINED");

    console.log("idRegistro: ",idRegistro);
    console.log("idCheck: ",idCheck);
    

    await axios.delete(`${API_URL}/checador/${idRegistro}/${idCheck}`, {
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

    // revalidatePath("/app/eventos");

    return {
      success: true,
      message: "Se ha eliminado el registro correctamente",
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

export async function generateFault(): Promise<string[]> {
  try {
    const { API_URL, apiToken } = await storeAction();
    const response = await axios
      .get(`${API_URL}/checador/registrarFaltas`, {
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

export async function fetchEventosReports(args: FetchArgs = {}): Promise<{
  data: AttendanceReportItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  try {
    const { API_URL, apiToken, session } = await storeAction();

    let url = `${API_URL}/checador/reports/${args.idPeriod}`;

    if (session?.role === "CHECADOR") url += `?idUser=${session?.id}`;

    const response = await axios.get(url, {
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
      return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
  }
}