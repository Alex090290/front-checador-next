"use server";

import { ActionResponse } from "@/lib/definitions";
import { storeToken } from "@/lib/useToken";
import axios from "axios";

export async function createUserImage({
  imageUrl,
}: {
  imageUrl: string;
}): Promise<ActionResponse<string>> {
  const { apiToken, apiUrl } = await storeToken();

  // const formData = new FormData();
  // const image = formData.get("image") as File;
  if (!imageUrl) throw new Error("La imagen no fue cargada");

  try {
    // Subir imagen al backend
    const data = new FormData();
    data.append("img", imageUrl);

    await axios.post(`${apiUrl}/users/imgProfile`, data, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // Obtener imagen en binario
    const resImg = await axios.get(`${apiUrl}/users/imgProfile`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      responseType: "arraybuffer",
    });

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
      message: error.response?.data?.message || error.message,
    };
  }
}
