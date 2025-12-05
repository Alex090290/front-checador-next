"use server";

import { ActionResponse, Vacations } from "@/lib/definitions";
import axios from "axios";
import { storeAction } from "./storeActions";

export async function fetchVacations(): Promise<Vacations[]> {
  try {
    const { apiToken, API_URL: apiUrl, session } = await storeAction();

    let query = "";

    if (session?.role === "EMPLOYEE" && session.isDoh === false)
      query += `?employee=${session.idEmployee}`;

    if (session?.role !== "EMPLOYEE" && session?.isDoh === false)
      query += `?leader=${session?.idEmployee}`;

    if (session?.isDoh === true) query += "";

    console.log(`${apiUrl}/vacations/listAll${query}`);

    const response = await axios
      .get(`${apiUrl}/vacations/listAll${query}`, {
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

export async function findVacationById({
  id,
}: {
  id: string | null;
}): Promise<Vacations | null> {
  try {
    if (!id) throw new Error("ID  NOT DEFINED");
    const vacations: Vacations[] = await fetchVacations();
    const getVacation = vacations.find((v) => v.id === Number(id)) || null;

    return getVacation;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}
