"use server";

import { ActionResponse, IOvertime } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";

export async function createOvertime({
  data,
}: {
  data: {
    idEmployee: string;
    idLeader: string;
    idPersonDoh: string;
    motive: string;
    hourInit: string;
    hourEnd: string;
  };
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, API_URL: apiUrl } = await storeAction();

    const response = await axios
      .post(
        `${apiUrl}/overtime`,
        {
          idEmployee: data.idEmployee,
          idLeader: data.idLeader,
          idPersonDoh: data.idPersonDoh,
          motive: data.motive,
          hourInit: data.hourInit,
          hourEnd: data.hourEnd,
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
      message: response.data.message,
      data: response.data.data.insertId,
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

export async function getOvertimeById({
  id,
}: {
  id: string | null;
}): Promise<IOvertime | null> {
  try {
    if (!id) throw new Error("ID NO DEFINED");

    const { apiToken, API_URL: apiUrl } = await storeAction();

    const response = await axios
      .get(`${apiUrl}/overtime/${id}`, {
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
    return null;
  }
}

export async function fetchOvertimes(): Promise<IOvertime[]> {
  try {
    const { apiToken, API_URL: apiUrl } = await storeAction();

    const response = await axios
      .get(`${apiUrl}/overtime`, {
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
