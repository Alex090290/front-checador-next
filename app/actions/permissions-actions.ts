"use server";

import { ActionResponse, IPermissionRequest } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";
import { storeToken } from "@/lib/useToken";
import { revalidatePath } from "next/cache";
import { base64ToBlob } from "@/lib/helpers";

export async function fetchPermissionsByEmployee(): Promise<
  IPermissionRequest[]
> {
  try {
    const { API_URL: apiUrl, apiToken, session } = await storeAction();

    const params = {
      ...(session?.role === "EMPLOYEE" ? { employee: session?.id } : {}),
      ...(session?.role !== "EMPLOYEE" ? { leader: session?.idEmployee } : {}),
    };

    const response = await axios
      .get(`${apiUrl}/permissionRequest/list`, {
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
          forHours: true,
          forDays: false,
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

    console.log(data);

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
    const resImg = await axios.get(
      `${apiUrl}/permissionRequest/signature/${idPermission}/${idEmployee}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        responseType: "arraybuffer",
      }
    );

    // Convertir a base64
    const base64 = Buffer.from(resImg.data, "binary").toString("base64");
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
