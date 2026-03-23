"use server";

import { ActionResponse, IPermissionRequest } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";
import { storeToken } from "@/lib/useToken";
import { revalidatePath } from "next/cache";
import { base64ToBlob } from "@/lib/helpers";

type FetchVacationsArgs = {
  page?: number;
  limit?: number;
  status?: string;
  leader?: number;
  personDoh?: number;
  employee?: number;
};

export async function fetchPermissionsByEmployee(
  args: FetchVacationsArgs = {}
): Promise<{
  data: IPermissionRequest[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  try {
    const { API_URL: apiUrl, apiToken, session } = await storeAction();

    const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);

    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", String(limitNum));

    // Si luego quieres soportar args.employee/leader/personDoh manual:
    if (args.employee) params.set("employee", String(args.employee));
    if (args.leader) params.set("leader", String(args.leader));
    if (args.personDoh) params.set("personDoh", String(args.personDoh));
    if (args.status) params.set("status", args.status);

    // Reglas por rol (mismo estilo que vacations)
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

    // DOH ve todo: no forzamos nada

    const url = `${apiUrl}/permissionRequest/list?${params.toString()}`;

    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${apiToken}` },
      }).then((res) => res.data);

    const total = Number(response.total ?? 0);
    const pages = Math.max(Math.ceil(total / limitNum), 1);

    return {
      data: response.data ?? [],
      total,
      page: pageNum,
      limit: limitNum,
      pages,
    };
  } catch (error) {
    console.log(error);
    return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
  }
}

export async function fetchPermissionsById({
  id,
}: {
  id: string;
}): Promise<IPermissionRequest | null> {
  try {
    const { API_URL: apiUrl, apiToken, session } = await storeAction();

    const response = await axios
      .get(`${apiUrl}/permissionRequest/listOne/${id}`, {
        params: {
          employee: session?.id,
        },
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

export async function createPermission({
  data,
}: {
  data: {
    idEmployee: number | null;
    idLeader: number | null;
    idPersonDoh: number | null;
    forHours: boolean;
    forDays: boolean;
    incidence: string;
    type: string;
    motive: string;
    dateInit: string;
    dateEnd: string;
    hourInit: string;
    hourEnd: string;
    signature: string;
  };
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, apiUrl } = await storeToken();
    const response = await axios
      .post(
        `${apiUrl}/permissionRequest`,
        {
          idEmployee: data.idEmployee,
          idLeader: data.idLeader,
          idPersonDoh: data.idPersonDoh,
          forHours: data.forHours,
          forDays: data.forDays,
          incidence: "PERMISOS",
          type: data.type,
          motive: data.motive,
          dateInit: data.dateInit,
          dateEnd: data.dateEnd,
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

    if (response.data.id) {
      const datax = new FormData();

      // 🔸 Convertir base64 a Blob
      const blob = base64ToBlob(data.signature, "image/png");

      // 🔸 Agregarlo a FormData como archivo
      datax.append("img", blob, "signature.png");
      await axios
        .post(
          `${apiUrl}/permissionRequest/signature/${response.data.id}`,
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
    revalidatePath("/app/permissions");

    return {
      success: true,
      message: response.message,
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

export async function approvedPermission({
  data,
}: {
  data: {
    id: string | null;
    signature: string;
    status: string;
  };
}): Promise<ActionResponse<boolean>> {
  try {
    if (!data.id) throw new Error("ID NOT DEFINED");

    const { apiToken, apiUrl } = await storeToken();

    await axios
      .put(
        `${apiUrl}/permissionRequest/approve/${data.id}`,
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
      .post(`${apiUrl}/permissionRequest/signature/${data.id}`, datax, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "multipart/form-data",
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

    revalidatePath("/app/permissions");

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

export async function approvedPermissionDoh({
  data,
}: {
  data: {
    id: string | null;
    signature: string;
    status: string;
  };
}): Promise<ActionResponse<boolean>> {
  try {
    if (!data.id) throw new Error("ID NOT DEFINED");

    const { apiToken, apiUrl } = await storeToken();

    await axios
      .put(
        `${apiUrl}/permissionRequest/approveDoh/${data.id}`,
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
      .post(`${apiUrl}/permissionRequest/signature/${data.id}`, datax, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "multipart/form-data",
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

    revalidatePath("/app/permissions");

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

export async function signatureDohPermission({
  data,
}: {
  data: {
    id: string | null;
    signature: string;
  };
}): Promise<ActionResponse<boolean>> {
  try {
    if (!data.id) throw new Error("ID NOT DEFINED");

    const { apiToken, apiUrl } = await storeToken();

    const datax = new FormData();

    // 🔸 Convertir base64 a Blob
    const blob = base64ToBlob(data.signature, "image/png");

    // 🔸 Agregarlo a FormData como archivo
    datax.append("img", blob, "signature.png");
    await axios
      .post(`${apiUrl}/permissionRequest/signature/${data.id}`, datax, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "multipart/form-data",
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

    revalidatePath("/app/permissions");

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

export async function fetchSignature({
  idEmployee,
  idPermission,
}: {
  idPermission: string | null;
  idEmployee: string | null;
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    // Obtener imagen en binario
    const resImg = await axios
      .get(
        `${apiUrl}/permissionRequest/signature/${idPermission}/${idEmployee}`,
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

export async function fetchPermissionPDF({
  id,
}: {
  id: string | null;
}): Promise<ActionResponse<string>> {
  try {
    if (!id) throw new Error("ID NOT DEFINED");

    const { apiToken, API_URL: apiUrl } = await storeAction();

    const resImg = await axios
      .get(`${apiUrl}/permissionRequest/generar-pdf/${Number(id)}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        responseType: "arraybuffer",
      })
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
