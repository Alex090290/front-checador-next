"use server";

import { auth } from "@/lib/auth";
import { ActionResponse, Position } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL;

// export async function fetchPositions(): Promise<ActionResponse<Position[]>> {
//   try {
//     const response = await axios
//       .get(`${API_URL}/`)
//       .then((res) => {
//         return res;
//       })
//       .catch((err) => {
//         return err;
//       });
//   } catch (error: any) {
//     console.log(error);
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// }

export async function createPosition({
  namePosition,
  idDepartment,
}: {
  namePosition: string;
  idDepartment: number;
}): Promise<ActionResponse<number | null>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
      .post(
        `${API_URL}/position`,
        {
          namePosition,
          idDepartment,
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
        return err.response;
      });

    if (response.data.status === 400) {
      throw new Error(response.data.message);
    }

    revalidatePath("/app/departments");

    return {
      success: true,
      message: "Puesto creado",
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
