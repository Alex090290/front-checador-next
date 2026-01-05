// app/actions/inability-actions.ts
"use server";

import axios, { AxiosError } from "axios";
import { storeAction } from "./storeActions";
import { ActionResponse, IInability, InabilityPayload } from "@/lib/definitions";
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
    console.log(axiosErr.response?.data?.message ?? axiosErr.message ?? "Error");
    return [];
  }
}

export async function getOneInability(id: number): Promise<IInability[]> {
  try {
    const { apiToken, API_URL } = await storeAction();
    const res = await axios.get<IResponse>(`${API_URL}/inability/one/${id}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    return res.data.data ?? [];
  } catch (err: unknown) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    console.log(axiosErr.response?.data?.message ?? axiosErr.message ?? "Error");
    return [];
  }
}

// app/actions/inability-actions.ts
export async function createInability(
  data: InabilityPayload
): Promise<ActionResponse<null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios.post(`${API_URL}/inability`, data, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    revalidatePath("/app/inability");

    return { success: true, message: "Incapacidad creada" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return { success: false, message };
  }
}


export async function updateInability(
  id: number,
  data: InabilityPayload
): Promise<ActionResponse<null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios.put(`${API_URL}/inability/${id}`, data, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    revalidatePath("/app/inability");

    return { success: true, message: "Incapacidad actualizada" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return { success: false, message };
  }
}

