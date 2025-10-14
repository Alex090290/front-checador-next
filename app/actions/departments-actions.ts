"use server";

import { auth } from "@/lib/auth";
import { ActionResponse, Department } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL;

export async function fetchDepartments(): Promise<Department[]> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
      .get(`${API_URL}/department/listAll`, {
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

    if (response.status >= 400) {
      throw new Error(`${response.response.data.message}`);
    }

    return response.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

export async function findDepartmentById({
  id,
  _id,
}: {
  id?: number | null;
  _id?: string;
}): Promise<Department | null> {
  const session = await auth();
  const apiToken = session?.user?.apiToken;

  let params = {};

  if (_id) params = { id: String(_id) };
  if (id) params = { id: Number(id) };

  const response = await axios
    .get(`${API_URL}/department/listOne`, {
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
}

export async function createDepartment({
  data,
}: {
  data: Department;
}): Promise<ActionResponse<Department | null>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    const response = await axios
      .post(
        `${API_URL}/department`,
        {
          nameDepartment: data.nameDepartment,
          description: data.description,
          idLeader: data.idLeader,
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
      message: "Departamento creado",
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

export async function updateDepartment({
  data,
  id,
}: {
  data: Department;
  id: number;
}): Promise<ActionResponse<Department | null>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    console.log(data);

    const response = await axios
      .put(
        `${API_URL}/department/${id}`,
        {
          nameDepartment: data.nameDepartment,
          description: data.description,
          idLeader: data.idLeader,
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

    if (response.data.status === 404) {
      throw new Error(response.data.message);
    }

    revalidatePath("/app/departments");

    return {
      success: true,
      message: "Departamento actualizado",
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

export async function deleteDepartment({
  id,
}: {
  id: number;
}): Promise<ActionResponse<Department | null>> {
  try {
    const session = await auth();
    const apiToken = session?.user?.apiToken;

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    const response = await axios
      .delete(`${API_URL}/department/${id}`, {
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

    if (response.data?.status === 400) {
      throw new Error(response.data.message);
    }

    revalidatePath("/app/departments");

    return {
      success: true,
      message: "Departamento eliminado",
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
