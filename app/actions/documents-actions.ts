"use server";

import { ActionResponse, IPeriod } from "@/lib/definitions";
import { storeAction } from "./storeActions";
import axios from "axios";
import { storeToken } from "@/lib/useToken";
import { revalidatePath } from "next/cache";

export async function fetchDocumentTypes({
  id,
}: {
  id: number;
}): Promise<IPeriod[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/employee/listTypesDocuments/${Number(id)}`, {
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

    console.log(response.data);

    return response.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

// export async function findDocumentTypes({
//   idEmployee,
//   idDocument,
// }: {
//   idEmployee: number;
//   idDocument: number;
// }): Promise<IPeriod[]> {
//   try {
//     const { apiToken, API_URL } = await storeAction();

//     const response = await axios
//       .get(
//         `${API_URL}/employee/listTypesDocuments/${Number(idEmployee)}/${Number(
//           idDocument
//         )}`,
//         {
//           headers: {
//             Authorization: `Bearer ${apiToken}`,
//           },
//         }
//       )
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

export async function createDocument({
  idEmployee,
  idDocument,
  idPeriod,
  formData,
}: {
  idEmployee: number;
  idDocument: number;
  idPeriod: number;
  formData: FormData;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    const image = formData.get("files") as File;

    // Subir imagen al backend
    const data = new FormData();
    data.append("file", image);

    const response = await axios
      .post(
        `${apiUrl}/employee/documents/${Number(
          idEmployee
        )}/${idDocument}/${idPeriod}`,
        data,
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

    revalidatePath("/app/employee");

    // await getViewDocument({ idDocument, idEmployee });

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

export async function getViewDocument({
  idEmployee,
  idDocument,
  idPeriod,
}: {
  idEmployee: number;
  idDocument: number;
  idPeriod: number;
}): Promise<ActionResponse<string>> {
  try {
    const { apiToken, apiUrl } = await storeToken();

    // Obtener imagen en binario
    const resImg = await axios
      .get(
        `${apiUrl}/employee/documents/${idEmployee}/${idDocument}/${idPeriod}`,
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
