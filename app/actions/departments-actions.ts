"use server";

import { auth } from "@/lib/auth";
import { Department } from "@/lib/definitions";
import axios, { AxiosResponse } from "axios";

const API_URL = process.env.API_URL;

export async function fetchDepartments(): Promise<Department[]> {
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
      return err.response;
    });

  return response.data.data;
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

  if (_id) params = { idMongo: String(_id) };
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

  return response.data.data;
}
