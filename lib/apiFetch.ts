// lib/apiFetch.ts
"use server";

import { signOut } from "@/lib/auth";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export async function apiFetch<T = any>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  try {
    return await axios[method]<T>(url, config);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await signOut({ redirectTo: "/auth" });
      throw new Error("TOKEN_EXPIRED");
    }
    throw error;
  }
}

// Después
// const response = await apiFetch("get", `${API_URL}/employee/listall?${params.toString()}`, {
//     headers: { Authorization: `Bearer ${apiToken}` },
// });