"use server";

import { ICurrentPeriod } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";


export async function getCurrentPeriod(): Promise<ICurrentPeriod | null> {
  try {

    const { apiToken, API_URL: apiUrl } = await storeAction();

    const response = await axios.get(`${apiUrl}/periods/currentPeriod`, {
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

export async function listPeriodsForYear({ year }:{ year:string }): Promise<ICurrentPeriod[] | null> {
  try {

    const { apiToken, API_URL: apiUrl } = await storeAction();

    const response = await axios.get(`${apiUrl}/periods/${year}`, {
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

