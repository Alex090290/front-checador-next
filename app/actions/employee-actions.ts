"use server";

import { auth } from "@/lib/auth";
import { ActionResponse, Employee } from "@/lib/definitions";
import { sanitizePhoneNumber } from "@/lib/sinitizePhone";
import axios from "axios";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL;

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
      .get(`${API_URL}/employee/listall`, {
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

    if (response.data.status >= 400) return [];

    return response.data || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

export async function findEmployeeById({
  id,
  _id,
}: {
  id?: number | null;
  _id?: string;
}): Promise<Employee | null> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    let params = {};

    if (_id) params = { idMongo: String(_id) };
    if (id) params = { id: Number(id) };

    const response = await axios
      .get(`${API_URL}/employee/listone`, {
        params,
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response;
      });

    return response.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createEmployee({
  data,
}: {
  data: {
    name: string;
    lastName: string;
    phonePersonal: string | null;
    emailPersonal: string | null;
    idCheck: number | null;
    passwordCheck: string | null;
    entryOffice: string | null;
    exitOffice: string | null;
    entryLunch: string | null;
    exitLunch: string | null;
    entrySaturdayOffice: string | null;
    exitSaturdayOffice: string | null;
    idDepartment: number | null;
    idPosition: number | null;
    branch: number | null;
    gender: "MASCULINO" | "FEMENINO";
    status: 1 | 2 | 3;
  };
}): Promise<ActionResponse<Employee | null>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const sanitizedPhone = sanitizePhoneNumber(
      data.phonePersonal as unknown as string
    );

    const response = await axios
      .post(
        `${API_URL}/employee`,
        {
          name: data.name,
          lastName: data.lastName,
          phonePersonal: sanitizedPhone,
          emailPersonal: data.emailPersonal,
          idCheck: data.idCheck,
          passwordCheck: data.passwordCheck,
          entryOffice: data.entryOffice,
          exitOffice: data.exitOffice,
          entryLunch: data.entryLunch,
          exitLunch: data.exitLunch,
          entrySaturdayOffice: data.entrySaturdayOffice,
          exitSaturdayOffice: data.exitSaturdayOffice,
          idDepartment: data.idDepartment,
          idPosition: data.idPosition,
          branch: data.branch,
          gender: data.gender,
          status: data.status,
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
      const errs = response.data.errors
        .map((err: { message: string }) => err.message)
        .join("\n");

      throw new Error(`${errs}`);
    }

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Empleado creado",
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

export async function updateEmploye({
  data,
  id,
}: {
  data: {
    name: string;
    lastName: string;
    phonePersonal: string | null;
    emailPersonal: string | null;
    idCheck: number | null;
    passwordCheck: string | null;
    entryOffice: string | null;
    exitOffice: string | null;
    entryLunch: string | null;
    exitLunch: string | null;
    entrySaturdayOffice: string | null;
    exitSaturdayOffice: string | null;
    idDepartment: number | null;
    idPosition: number | null;
    branch: number | null;
    gender: "MASCULINO" | "FEMENINO";
    status: 1 | 2 | 3;
  };
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    const sanitizedPhone = sanitizePhoneNumber(
      data.phonePersonal as unknown as string
    );

    const response = await axios
      .put(
        `${API_URL}/employee/${String(id)}`,
        {
          name: data.name,
          lastName: data.lastName,
          phonePersonal: sanitizedPhone,
          emailPersonal: data.emailPersonal,
          idCheck: data.idCheck,
          passwordCheck: data.passwordCheck,
          entryOffice: data.entryOffice,
          exitOffice: data.exitOffice,
          entryLunch: data.entryLunch,
          exitLunch: data.exitLunch,
          entrySaturdayOffice: data.entrySaturdayOffice,
          exitSaturdayOffice: data.exitSaturdayOffice,
          idDepartment: data.idDepartment,
          idPosition: data.idPosition,
          branch: data.branch,
          gender: data.gender,
          status: data.status,
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
      const errs = response.data.errors
        .map((err: { message: string }) => err.message)
        .join("\n");

      console.log(errs);
      throw new Error(`${errs}`);
    }

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Empleado actualizado",
      data: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
      data: false,
    };
  }
}

export async function deleteEmployee({
  id,
}: {
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    if (!id) throw Error("ID NO ESPECIFICADO");

    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
      .delete(`${API_URL}/employee/${String(id)}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response;
      });

    console.log(response);

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Empleado eliminado",
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
