"use server";

import { auth, signIn } from "@/lib/auth";
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

const API_URL = process.env.API_URL;

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
    const response = await axios
      .post(`${API_URL}/users/login`, {
        email,
        password,
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response;
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
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (response.data.status === 401) {
      throw new Error("Acceso denegado (401)");
    }

    return {
      success: true,
      message: response.data.mesaage,
      data: response.data.data,
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
    const session = await auth();
    const apiToken = session?.user?.apiToken;

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
        console.log(err.response.data);
        return [];
      });

    return response.data ?? [];

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
    const session = await auth();
    const apiToken = session?.user?.apiToken;

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
        console.log(err.response.data);
        return null;
      });

    return response.data;

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
}: {
  name: string;
  lastName: string;
  email: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  role: UserRole | null;
  permissions: Permission[];
  status: number;
  phone: PhoneNumberFormat | string | null;
}) {
  const session = await auth();
  const apiToken = session?.user?.apiToken;

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
      console.log(err.response.data);
      return null;
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
  const session = await auth();
  const apiToken = session?.user?.apiToken;

  const sanitizedPhone = sanitizePhoneNumber(phone as unknown as string);

  const response = await axios
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
      return err.response.data;
    });

  if (response.status === 400) {
    return response.message;
  }

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
  const session = await auth();
  const apiToken = session?.user?.apiToken;

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
      console.log(err.response.data);
      return null;
    });

  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
}
