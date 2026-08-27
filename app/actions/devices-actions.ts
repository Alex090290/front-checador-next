"use server"

import { FetchUsersArgs } from "@/lib/constancy/interface";
import { IAssignDevice, IDevices } from "@/lib/devices/interface";
import { storeAction } from "./storeActions";
import axios from "axios";
import { ActionResponse } from "@/lib/definitions";
import { revalidatePath } from "next/cache";
import { PhoneNumberFormat, sanitizePhoneNumber } from "@/lib/sinitizePhone";
import { storeToken } from "@/lib/useToken";
import { base64ToBlob } from "@/lib/helpers";

function getPhoneString(
  value: PhoneNumberFormat | string | null | undefined
): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value.internationalNumber || value.number || "";
}


//LISTAR TODOS LOS DISPOSITIVOS
export async function ListDevices(args: FetchUsersArgs & {
  search?: string;
  type?: string;
  status?: string;
  idEmployee?: string;
  idDepartment?: string;
  idBranch?: string;
} = {}): Promise<{
  data: IDevices[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);


    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", String(limitNum));

    if (args.search?.trim()) {
      params.set("search", args.search.trim());
    }
    if (args.type?.trim()) {
      params.set("type", args.type.trim());
    }
    if (args.status?.trim()) {
      params.set("status", args.status.trim());
    }
    if (args.idEmployee !== undefined && !Number.isNaN(Number(args.idEmployee))) {
      params.set("idEmployee", String(args.idEmployee));
    }
    if (args.idDepartment !== undefined && !Number.isNaN(Number(args.idDepartment))) {
      params.set("idDepartment", String(args.idDepartment));
    }
    if (args.idBranch !== undefined && !Number.isNaN(Number(args.idBranch))) {
      params.set("idBranch", String(args.idBranch));
    }


    const response = await axios
      .get(`${API_URL}/devices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err);
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

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

//LISTAR UN DISPOSITIVO
export async function ListOneDevice({
  id,
}: {
  id?: number | null;
}): Promise<IDevices | null> {

  try {
    if (!id || id <= 0) return null;

    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/devices/${id}`, {
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

    return response.data?.data ?? response.data ?? null;

  } catch (error) {

    console.log(error);
    return null;
  }
}

//CREAR DISPOSITIVO
export async function createDevice({
  data,
}: {
  data: IDevices;
}): Promise<ActionResponse<IDevices | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const sanitizedPhonePersonal = sanitizePhoneNumber(
      getPhoneString(String(data.currentAssignment?.phoneNumber))
    );

    const device: IDevices = await axios
      .post(
        `${API_URL}/devices`,
        {
          name: data.name,
          type: data.type,
          status: data.status,
          networkInfo: data.networkInfo,
          specs: data.specs,
          currentAssignment: {
            idEmployee: data.currentAssignment?.idEmployee,
            idBranch: data.currentAssignment?.idBranch,
            idDepartment: data.currentAssignment?.idDepartment,
            phoneNumber: sanitizedPhonePersonal,
            extentionNumber: data.currentAssignment?.extentionNumber,
            emailCompany: data.currentAssignment?.emailCompany,
            emailGmail: data.currentAssignment?.emailGmail,
            location: data.currentAssignment?.location,
            assignedAt: data.currentAssignment?.assignedAt
          },
          idIt: data.idIt,
          notes: data.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
        const msg = err.response?.data?.message;
        throw new Error(
          Array.isArray(msg) ? msg.join(", ") : msg || "Error en la respuesta"
        );
      });

    revalidatePath("/app/devices");

    return {
      success: true,
      message: "Dispositivo creado correctamente",
      data: device,
    };
  } catch (error: unknown) {
    console.log(error);

    let message = "Error en la respuesta";

    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message;
      message = Array.isArray(msg) ? msg.join(", ") : msg || error.message || message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message,
      data: null,
    };
  }
}

//ASIGNAR UN DISPOSITIVO A UN EMPLEADO
export async function AssignDevice({
  idDevice,
  data
}: {
  idDevice: number;
  data: IAssignDevice;
}): Promise<ActionResponse<boolean | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();
    await axios.put(
      `${API_URL}/devices-assignment/${idDevice}`,
      {
        idEmployee: data.idEmployee,
        idIt: data.idIt,
        idBranch: data.idBranch,
        idDepartment: data.idDepartment,
        location: data.location,
        assignedAt: data.assignedAt
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    revalidatePath("/app/devices");

    return {
      success: true,
      message: "Empleado asignado correctamente",
      data: true,
    };
  } catch (error: unknown) {
    console.log(error);

    let message = "Error en la respuesta";

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message,
      data: null,
    };
  }
}

//ACTUALIZAR DISPOSITIVO
export async function updateDevice({
  data,
  idDevice,
}: {
  data: IDevices;
  idDevice: number;
}): Promise<ActionResponse<IDevices | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    if (!idDevice) {
      throw new Error("No se ha definido ID");
    }
    await axios
      .put(
        `${API_URL}/devices/${idDevice}`,
        {
          name: data.name,
          type: data.type,
          status: data.status,
          ...(data.networkInfo?.length > 0 && { networkInfo: data.networkInfo }),
          specs: data.specs,
          notes: data.notes ?? "",
          ...(data.currentAssignment?.idEmployee != null && {
            currentAssignment: data.currentAssignment,
          }),
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
          err.response?.data?.message
            ? Array.isArray(err.response.data.message)
              ? err.response.data.message.join(", ")
              : err.response.data.message
            : "Error en la respuesta"
        );
      });

    revalidatePath("/app/devices");

    return {
      success: true,
      message: "Dispositivo actualizado",
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

//PUT DE FIRMAS
export async function sendSignatureDevice({
  idDevice,
  idSignature,
  idEmployee,
  signature,
}: {

  idDevice: number | null;
  idSignature: number;
  idEmployee: number;
  signature: string;

}): Promise<ActionResponse<boolean>> {
  try {
    // if (!idDevice) throw new Error("Id no definido");
    if (!signature) throw new Error("No se recibió la firma");

    const { apiToken, apiUrl } = await storeToken();

    const formData = new FormData();

    const blob = base64ToBlob(signature, "image/png");

    formData.append("signature", blob, "signature.png");

    const url = `${apiUrl}/devices-signature/${idDevice}/${idSignature}/${idEmployee}`

    const firma = await axios.put(url, formData, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    console.log("firma: ", firma);

    return {
      success: true,
      message: "Firma enviada correctamente",
      data: true,
    };
  } catch (error: unknown) {
    const err = error as Error;

    return {
      success: false,
      message: err.message ? err.message : "Error al obtener información",
      data: false,
    };
  }
}

//TRAER FIRMAS
export async function fetchSignatureDevice({
  idDevice,
  idSignature,
  idEmployee,
}: {
  idDevice: number;
  idSignature: number;
  idEmployee: number;
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    // Obtener imagen en binario
    const resImg = await axios
      .get(
        `${apiUrl}/devices-signature/${idDevice}/${idSignature}/${idEmployee}`,
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