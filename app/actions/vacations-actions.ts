"use server";

import { ActionResponse, PeriodVacation, Vacations } from "@/lib/definitions";
import axios from "axios";
import { storeAction } from "./storeActions";
import { storeToken } from "@/lib/useToken";
import { revalidatePath } from "next/cache";
import { base64ToBlob } from "@/lib/helpers";

// export async function fetchVacations(): Promise<Vacations[]> {
//   try {
//     const { apiToken, API_URL: apiUrl, session } = await storeAction();

//     let query = "";

//     if (session?.role === "EMPLOYEE" && session.isDoh === false)
//       query += `?employee=${session.idEmployee}`;

//     if (session?.role !== "EMPLOYEE" && session?.isDoh === false)
//       query += `?leader=${session?.idEmployee}`;

//     if (session?.isDoh === true) query += "";

//     const response = await axios
//       .get(`${apiUrl}/vacations/listAll${query}`, {
//         headers: {
//           Authorization: `Bearer ${apiToken}`,
//         },
//       })
//       .then((res) => {
//         return res.data;
//       })
//       .catch((err) => {
//         throw new Error(
//           err.response.data.message
//             ? err.response.data.message
//             : "Error en la respuesta"
//         );
//       });

//     return response.data;

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.log(error);
//     return [];
//   }
// }


export type FetchVacationsParams = {
  page?: number;
  limit?: number;
};

export type VacationsPagedResult = {
  data: Vacations[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};
type FetchVacationsArgs = {
  page?: number;
  limit?: number;
  status?: string;
  leader?: number;
  personDoh?: number;
  employee?: number;
};

export async function fetchVacations(args: FetchVacationsArgs = {}): Promise<{
  data: Vacations[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  try {
    const { apiToken, API_URL: apiUrl, session } = await storeAction();

    const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);

    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", String(limitNum));

    // ✅ filtros opcionales (si quisieras usarlos manualmente)
    if (args.status) params.set("status", args.status);
    if (args.leader) params.set("leader", String(args.leader));
    if (args.personDoh) params.set("personDoh", String(args.personDoh));
    if (args.employee) params.set("employee", String(args.employee));

    /**
     * ✅ reglas por sesión (estas deben dominar para que no puedan listar de más)
     */
    if (session?.role === "EMPLOYEE" && session.isDoh === false) {
      params.set("employee", String(session.idEmployee));
      params.delete("leader");
      params.delete("personDoh");
    }

    if (session?.role !== "EMPLOYEE" && session?.isDoh === false) {
      params.set("leader", String(session.idEmployee));
      params.delete("employee");
      params.delete("personDoh");
    }

    // si es DOH, no forzamos filtros (puede ver todo)
    const url = `${apiUrl}/vacations/listAll?${params.toString()}`;

    const response = await axios
      .get(url, {
        headers: { Authorization: `Bearer ${apiToken}` },
      })
      .then((res) => res.data);

    const total = Number(response.total ?? 0);
    const pages = Math.max(Math.ceil(total / limitNum), 1);

    return {
      data: response.data ?? [],
      total,
      page: pageNum,
      limit: limitNum,
      pages,
    };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
  }
}

export async function fetchVacationByEmployee({
  idEmployee,
}: {
  idEmployee: number | null;
}): Promise<Vacations[]> {
  try {
    if (!idEmployee) throw new Error("ID NOT DEFINED");

    const { apiToken, API_URL: apiUrl } = await storeAction();

    const response = await axios
      .get(`${apiUrl}/vacations/listOne/${idEmployee}`, {
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

export async function deleteVacation(idRequest: number, idPeriod: number): Promise<ActionResponse<boolean>> {
  try {
    if (!idRequest) throw new Error("ID NOT DEFINED");

    const { apiToken, apiUrl } = await storeToken();

    await axios.delete(`${apiUrl}/vacations/${idRequest}/${idPeriod}`,{
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


    revalidatePath("/app/vacationList");

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

export async function fetchVacatiionPDF({
  id,
}: {
  id: string | null;
}): Promise<ActionResponse<string>> {
  try {
    if (!id) throw new Error("ID NOT DEFINED");

    const { apiToken, API_URL: apiUrl } = await storeAction();

    const resImg = await axios
      .post(
        `${apiUrl}/vacations/generar-pdf/${Number(id)}`,
        {},
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
        console.log(err.response);
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error al descargar el PDF"
        );
      });

    // Convertir a base64
    const base64 = Buffer.from(resImg, "binary").toString("base64");
    const pdfBase64Url = `data:application/pdf;base64,${base64}`;

    return {
      success: true,
      message: "Archivo descargado",
      data: pdfBase64Url,
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
