// app/actions/inability-actions.ts
"use server";

import axios, { AxiosError } from "axios";
import { storeAction } from "./storeActions";
import {
  ActionResponse,
  IInability,
  InabilityPayload,
} from "@/lib/definitions";
import { revalidatePath } from "next/cache";

type IResponse = {
  message: string;
  status: number;
  data: IInability[];
};

export interface IResponseInabilityCreate {
  message: string;
  status: number;
  data: {
    id: number;
    idDocument: number;
    acknowledged: boolean;
    insertedId: string;
  };
}

// ✅ REQUEST BODY (lo que realmente mandas al backend)
export type InabilityDocPayload = {
  dateInit: string;
  dateEnd: string;
  inProgress: boolean;
  urlDocument: string;
};

export type InabilityPayloadBase = {
  idEmployee: number;
  accountingConfirmation: boolean;
  disabilityCategory: string;
  typeOfDisability: string;
  status: string;

  documentsInability: InabilityDocPayload[];

  sT2DischargeDocument?: { urlDocument: string };
  sT7FillingDocumentv1?: { urlDocument: string };
  sT7FillingDocumentv2?: { urlDocument: string };
};

// ✅ CREATE payload
export type InabilityCreatePayload = InabilityPayloadBase & {
  whoCreateId?: number; // si tu backend lo ocupa
};

// ✅ UPDATE payload (tu backend parece ocupar id e idDocument)
export type InabilityUpdatePayload = InabilityPayloadBase & {
  id: number;
  idDocument: number;
};

export async function getAllInability(): Promise<IInability[]> {
  try {
    const { apiToken, API_URL } = await storeAction();
    const res = await axios.get<IResponse>(`${API_URL}/inability/all`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    return res.data.data ?? [];
  } catch (err: unknown) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    console.log(
      axiosErr.response?.data?.message ?? axiosErr.message ?? "Error"
    );
    return [];
  }
}

export async function getOneInability(id: number): Promise<IInability | null> {
  try {
    const { apiToken, API_URL } = await storeAction();
    const res = await axios.get(`${API_URL}/inability/one/${id}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    return res.data.data;
  } catch (err: unknown) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    console.log(
      axiosErr.response?.data?.message ?? axiosErr.message ?? "Error"
    );
    return null;
  }
}

// app/actions/inability-actions.ts
export async function createInability(
  data: InabilityPayload & { firstDoc: FileList | null }
): Promise<ActionResponse<string>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const document = new FormData();

    if (data.firstDoc) {
      document.append("document", data.firstDoc?.[0]);
    }

    const response = await axios
      .post(`${API_URL}/inability`, data, {
        headers: { Authorization: `Bearer ${apiToken}` },
      })
      .then(async (res) => {
        if (data.firstDoc) {
          await uploadFirstInhabilityDocument({
            formData: document,
            idDoc: res.data.data.id,
          });
        }
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

    revalidatePath("/app/inability");

    return {
      success: true,
      message: "Incapacidad creada",
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

export async function uploadFirstInhabilityDocument({
  idDoc,
  formData,
}: {
  idDoc: string;
  formData: FormData;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, API_URL: apiUrl } = await storeAction();

    const image = formData.get("document") as File;

    // Subir imagen al backend
    const data = new FormData();
    data.append("document", image);

    const response = await axios
      .put(`${apiUrl}/inability/documentsInability/${idDoc}/1`, data, {
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

    return {
      success: true,
      message: response.message,
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

export async function updateInability(
  id: number,
  data: InabilityPayload & { firstDoc: FileList | null }
): Promise<ActionResponse<null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const document = new FormData();

    if (data.firstDoc) {
      document.append("document", data.firstDoc?.[0]);
    }

    await axios
      .put(`${API_URL}/inability/documentsInability/${id}/1`, document, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (res) => {
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

    revalidatePath("/app/inability");

    return { success: true, message: "Incapacidad actualizada" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function createNewDocument({
  idDoc,
  dateInit,
  dateEnd,
  formData,
}: {
  idDoc: string;
  dateInit: string;
  dateEnd: string;
  formData: FileList | null;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios
      .post(
        `${API_URL}/inability/newDocumentsInability`,
        {
          id: idDoc,
          dateInit,
          dateEnd,
        },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        }
      )
      .then(async (res) => {
        const selfId = res.data.data.idDocument;
        const newFormData = new FormData();
        if (formData) newFormData.append("files", formData?.[0]);
        await updateInabilityModal({ formData: newFormData, idDoc, selfId });
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

    revalidatePath("/app/inability");

    return {
      success: true,
      message: "El nuevo documento ha sido creado...",
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

export async function updateInabilityModal({
  idDoc,
  selfId,
  formData,
}: {
  idDoc: string;
  selfId: string | null;
  formData: FormData;
}): Promise<ActionResponse<null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const image = formData.get("files") as File;

    // Subir imagen al backend
    const data = new FormData();
    data.append("document", image);

    await axios
      .put(`${API_URL}/inability/documentsInability/${idDoc}/${selfId}`, data, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (res) => {
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

    revalidatePath("/app/inability");

    return { success: true, message: "Incapacidad actualizada" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function uploadDocuments({
  idDoc,
  dateInit,
  dateEnd,
  formData,
}: {
  idDoc: string;
  dateInit: string;
  dateEnd: string;
  formData: FormData;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const image = formData.get("files") as File;

    // Subir imagen al backend
    const data = new FormData();
    data.append("document", image);

    const response = await axios
      .post(
        `${API_URL}/inability/newDocumentsInability`,
        {
          id: idDoc,
          dateInit,
          dateEnd,
        },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
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
            : "Error desconhecido"
        );
      });

    if (response && response.data.status === 200) {
      await axios.put(
        `${API_URL}/inability/documentsInability/${idDoc}/1`,
        data,
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        }
      );
    }
    return {
      success: true,
      message: "Docuemento cargado",
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

export async function getInhabilityDocument({
  idDoc,
  selfId,
}: {
  idDoc: string | null;
  selfId: string | null;
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, API_URL: apiUrl } = await storeAction();
    console.log(`${apiUrl}/inability/documentsInability/${idDoc}/${selfId}`);

    if (!idDoc || !selfId) throw new Error("ID NOT DEFINED");

    // Obtener imagen en binario
    const resImg = await axios
      .get(`${apiUrl}/inability/documentsInability/${idDoc}/${selfId}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        responseType: "arraybuffer",
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

    // Convertir a base64
    const base64 = Buffer.from(resImg, "binary").toString("base64");
    const pdfBase64Url = `data:application/pdf;base64,${base64}`;

    return {
      success: true,
      message: "Imagen subida correctamente",
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
