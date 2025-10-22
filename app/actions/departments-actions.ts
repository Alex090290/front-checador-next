"use server";

import { ActionResponse, Department } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { storeAction } from "./storeActions";

export async function fetchDepartments(): Promise<Department[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

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

export async function findDepartmentById({
  id,
  _id,
}: {
  id?: number | null;
  _id?: string;
}): Promise<Department | null> {
  const { apiToken, API_URL } = await storeAction();

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
      throw new Error(
        err.response.data.message
          ? err.response.data.message
          : "Error en la respuesta"
      );
    });

  return response.data || null;
}

export async function createDepartment({
  data,
}: {
  data: Department;
}): Promise<ActionResponse<Department | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    await axios
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
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

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
    const { apiToken, API_URL } = await storeAction();

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    await axios
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
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

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
    const { apiToken, API_URL } = await storeAction();

    if (!id) {
      throw new Error("No se ha definido ID");
    }

    await axios
      .delete(`${API_URL}/department/${id}`, {
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
