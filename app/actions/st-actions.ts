"use server";

import axios from "axios";
import { storeAction } from "./storeActions";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/lib/definitions";

export async function uploadST({
  version,
  idDoc,
  formData,
}: {
  version: string;
  idDoc: string;
  formData: FormData;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, API_URL: apiUrl } = await storeAction();

    const image = formData.get("files") as File;

    // Subir imagen al backend
    const data = new FormData();
    data.append("document", image);

    const response = await axios
      .put(`${apiUrl}/inability/${version}/${idDoc}`, data, {
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

    revalidatePath("/app/inability");

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

export async function getViewSTDocument({
  version,
  idDoc,
}: {
  version: string;
  idDoc: string;
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, API_URL: apiUrl } = await storeAction();

    // Obtener imagen en binario
    const resImg = await axios
      .get(`${apiUrl}/inability/${version}/${idDoc}`, {
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
