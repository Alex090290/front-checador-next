"use server";

import { ActionResponse, Newsletter } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";
import { storeToken } from "@/lib/useToken";
import { revalidatePath } from "next/cache";

export async function fetchNewsletters(): Promise<Newsletter[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/notice/listAll`, {
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

    return response.data || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

export async function findNewslettersById({
  id,
}: {
  id: string | null;
}): Promise<Newsletter | null> {
  try {
    if (!id) throw new Error("ID NOT DEFINED");

    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/notice/listAll`, {
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

    const newsletter: Newsletter = response.data.find(
      (n: Newsletter) => n.id === Number(id)
    );

    const getImg = await axios
      .get(`${API_URL}/notice/img/${newsletter.id}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        responseType: "arraybuffer",
      })
      .then((res) => {
        return res.data;
      });

    const base64 = Buffer.from(getImg, "binary").toString("base64");
    const imageBase64Url = `data:image/jpeg;base64,${base64}`;

    const newResponse = {
      ...newsletter,
      img: imageBase64Url,
    };

    return newResponse || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function getActiveNotice(): Promise<Newsletter | null> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/notice/listActive`, {
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

    const newsletter = response.data;

    const getImg = await axios
      .get(`${API_URL}/notice/img/${newsletter.id}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        responseType: "arraybuffer",
      })
      .then((res) => {
        return res.data;
      });

    const base64 = Buffer.from(getImg, "binary").toString("base64");
    const imageBase64Url = `data:image/jpeg;base64,${base64}`;

    const newResponse = {
      ...newsletter,
      img: imageBase64Url,
    };

    return newResponse || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createNewsletter({
  data,
}: {
  data: {
    img: string | null;
    title: string;
    text: string;
    dateInitiPublish: string;
    hourInitiPublish: string;
    dateEndPublish: string;
    hourEndPublish: string;
  };
}): Promise<ActionResponse<Newsletter | null>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    const response = await axios
      .post(
        `${apiUrl}/notice`,
        {
          title: data.title,
          text: data.text,
          dateInitiPublish: data.dateInitiPublish,
          hourInitiPublish: data.hourInitiPublish,
          dateEndPublish: data.dateEndPublish,
          hourEndPublish: data.hourEndPublish,
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      )
      .then(async (res) => {
        console.log("RESPUESTA:", res.data.data);
        const file = data.img || "";
        console.log("FILE", file);
        const formData = new FormData();
        formData.append("img", file);

        if (!res.data.data.id && !file) throw new Error("Error de imagen");

        await axios
          .put(`${apiUrl}/notice/img/${res.data.data.id}`, formData, {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          })
          .then((resImg) => {
            return resImg;
          });
        return res;
      });
    // .catch((err) => {
    //   console.log("ERROR DE CATCH:", err);
    //   throw new Error("Error en la respuesta");
    // });

    revalidatePath("/app/newsletter");

    return {
      success: true,
      message: "Se ha creador la publicación",
      data: response.data,
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
