"use server";

import { signIn } from "@/lib/auth";
import {
  ActionResponse,
  ApiResponse,
  Permission,
  User,
  UserRole,
} from "@/lib/definitions";
import { PhoneNumberFormat, sanitizePhoneNumber } from "@/lib/sinitizePhone";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { storeAction } from "./storeActions";

export async function userLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ActionResponse<boolean>> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: "Success",
      data: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: String(error?.cause?.err ?? error.message),
    };
  }
}

export async function userLoginCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ActionResponse<ApiResponse<string>>> {
  try {
    const { API_URL } = await storeAction();

    const response = await axios
      .post(`${API_URL}/users/login`, {
        email,
        password,
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
      message: response.data,
      data: response,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error.mesaage);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function getUserData({
  apiToken,
}: {
  apiToken: string;
}): Promise<ActionResponse<ApiResponse<User>>> {
  try {
    const { API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/me`, {
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

    return {
      success: true,
      message: response.data.mesaage,
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

export async function fetchUsers(): Promise<User[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const response = await axios
      .get(`${API_URL}/allUsers`, {
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

export async function findUserById({
  id,
  _id,
}: {
  id?: number | null;
  _id?: string;
}): Promise<User | null> {
  try {
    const { apiToken, API_URL } = await storeAction();

    let params = {};

    if (_id) params = { idMongo: String(_id) };
    if (id) params = { id: Number(id) };

    const response = await axios
      .get(`${API_URL}/user`, {
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

    return response.data || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createUser({
  name,
  lastName,
  email,
  gender,
  role,
  permissions,
  status,
  phone,
  password,
}: {
  name: string;
  lastName: string;
  email: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  role: UserRole | null;
  permissions: Permission[];
  status: number;
  phone: PhoneNumberFormat | string | null;
  password: string;
}) {
  const { apiToken, API_URL } = await storeAction();

  const sanitizedPhone = sanitizePhoneNumber(phone as unknown as string);

  await axios
    .post(
      `${API_URL}/users`,
      {
        name,
        lastName,
        email,
        gender,
        role,
        permissions,
        status,
        phone: sanitizedPhone,
        password,
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

  revalidatePath("/app/users");
}

export async function updateUser({
  name,
  lastName,
  email,
  gender,
  role,
  permissions,
  status,
  phone,
  id,
}: {
  name: string;
  lastName: string;
  email: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  role: UserRole | null;
  permissions: Permission[];
  status: number;
  phone: PhoneNumberFormat | string | null;
  id: number;
}): Promise<string | boolean> {
  const { apiToken, API_URL } = await storeAction();

  const sanitizedPhone = sanitizePhoneNumber(phone as unknown as string);

  await axios
    .put(
      `${API_URL}/users/${id}`,
      {
        name,
        lastName,
        email,
        gender,
        role,
        permissions,
        status: Number(status),
        phone: sanitizedPhone,
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

  revalidatePath("/app/users");
  return true;
}

export async function updatePasswordUser({
  password,
  id,
}: {
  password: string;
  id: number;
}): Promise<boolean> {
  const { apiToken, API_URL } = await storeAction();

  const response = await axios
    .put(
      `${API_URL}/users/${id}/password`,
      {
        password,
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

  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
}

export async function unsubscribeUser({
  dischargeReason,
  id,
}: {
  dischargeReason: string;
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios
      .put(
        `${API_URL}/employee/unsubscribe/${id}`,
        {
          dischargeReason,
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

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "",
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

export async function reEntryUser({
  id,
}: {
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios
      .put(
        `${API_URL}/employee/reEntry/${id}`,
        {},
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

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Reingreso completado",
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

export async function loadAvatar(): Promise<ActionResponse<string>> {
  try {
    const { API_URL: apiUrl, apiToken } = await storeAction();
    // Obtener imagen en binario
    if (!apiToken) throw new Error("TOKEN IS REQUIRED");
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
      message: "Imagen cargada",
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
