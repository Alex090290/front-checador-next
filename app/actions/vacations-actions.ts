"use server";

import { ActionResponse, PeriodVacation, Vacations } from "@/lib/definitions";
import axios from "axios";
import { storeAction } from "./storeActions";
import { storeToken } from "@/lib/useToken";
import { revalidatePath } from "next/cache";
import { base64ToBlob } from "@/lib/helpers";

export async function fetchVacations(): Promise<Vacations[]> {
  try {
    const { apiToken, API_URL: apiUrl, session } = await storeAction();

    let query = "";

    console.log("ROLE: " + session?.role);
    console.log("ISDOH: " + session?.isDoh);

    if (session?.role === "EMPLOYEE" && session.isDoh === false)
      query += `?employee=${session.idEmployee}`;

    if (session?.role !== "EMPLOYEE" && session?.isDoh === false)
      query += `?leader=${session?.idEmployee}`;

    if (session?.isDoh === true) query += "";

    console.log("QUERY: " + query);
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

export async function fetchPeriods({
  idEmployee,
}: {
  idEmployee: number | null;
}): Promise<PeriodVacation[]> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    const response = await axios
      .get(`${apiUrl}/vacations/listPeriods/${idEmployee}`, {
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
    const { apiToken, apiUrl } = await storeToken();

    const response = await axios
      .get(`${apiUrl}/vacations/listOneRequest/${id}`, {
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

export async function createVacation({
  data,
}: {
  data: {
    idEmployee: number | null;
    idLeader: number | null;
    idPersonDoh: number | null;
    idPeriod: number | null;
    incidence: string;
    periodDescription: string;
    dateInit: string;
    dateEnd: string;
    signature: string;
  };
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    const response = await axios
      .post(
        `${apiUrl}/vacations`,
        {
          idEmployee: data.idEmployee,
          idLeader: data.idLeader,
          idPersonDoh: data.idPersonDoh,
          idPeriod: data.idPeriod,
          incidence: "VACACIONES",
          periodDescription: data.periodDescription,
          twoHundredthPeriod: 1,
          biWeeklyPeriodVacationBonus: 1,
          dateInit: data.dateInit,
          dateEnd: data.dateEnd,
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

    console.log(response.data.id);

    if (response.data.id) {
      const datax = new FormData();

      // 🔸 Convertir base64 a Blob
      const blob = base64ToBlob(data.signature, "image/png");

      // 🔸 Agregarlo a FormData como archivo
      datax.append("img", blob, "signature.png");
      await axios
        .post(
          `${apiUrl}/vacations/signature/${response.data.id}/${data.idPeriod}`,
          datax,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              "Content-Type": "multipart/form-data",
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
    }

    revalidatePath("/app/vacations");

    return {
      success: true,
      message: "Registro creado",
      data: response.data.id,
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

export async function fetchVacationSignature({
  data,
}: {
  data: {
    idSolicitud: number | null;
    idPeriod: number | null;
    idEmployee: number | null;
  };
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, apiUrl } = await storeToken();
    // Obtener imagen en binario
    const resImg = await axios
      .get(
        `${apiUrl}/vacations/signature/${data.idSolicitud}/${data.idPeriod}/${data.idEmployee}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          responseType: "arraybuffer",
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

    // Convertir a base64
    const base64 = Buffer.from(resImg, "binary").toString("base64");
    const imageBase64Url = `data:image/jpeg;base64,${base64}`;

    return {
      success: true,
      message: "Imagen subida correctamente",
      data: imageBase64Url,
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

export async function approvedVacation({
  data,
}: {
  data: {
    id: string | null;
    signature: string;
    idPeriod: number;
    status: string;
  };
}): Promise<ActionResponse<boolean>> {
  try {
    if (!data.id) throw new Error("ID NOT DEFINED");

    const { apiToken, apiUrl } = await storeToken();

    await axios
      .put(
        `${apiUrl}/vacations/approve/${data.id}/${data.idPeriod}`,
        {
          status: data.status,
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

    const datax = new FormData();

    // 🔸 Convertir base64 a Blob
    const blob = base64ToBlob(data.signature, "image/png");

    // 🔸 Agregarlo a FormData como archivo
    datax.append("img", blob, "signature.png");
    await axios
      .post(
        `${apiUrl}/vacations/signature/${data.id}/${data.idPeriod}`,
        datax,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "multipart/form-data",
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

    revalidatePath("/app/vacations");

    return {
      success: true,
      message: "Proceso completado",
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

export async function approvedVacationDoh({
  data,
}: {
  data: {
    id: string | null;
    signature: string;
    idPeriod: number;
    status: string;
  };
}): Promise<ActionResponse<boolean>> {
  try {
    if (!data.id) throw new Error("ID NOT DEFINED");

    const { apiToken, apiUrl } = await storeToken();

    await axios
      .put(
        `${apiUrl}/vacations/approveDoh/${data.id}/${data.idPeriod}`,
        {
          status: data.status,
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

    const datax = new FormData();

    // 🔸 Convertir base64 a Blob
    const blob = base64ToBlob(data.signature, "image/png");

    // 🔸 Agregarlo a FormData como archivo
    datax.append("img", blob, "signature.png");
    await axios
      .post(
        `${apiUrl}/vacations/signature/${data.id}/${data.idPeriod}`,
        datax,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "multipart/form-data",
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

    revalidatePath("/app/vacations");

    return {
      success: true,
      message: "Proceso completado",
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
