// app/actions/menuActions.ts
import "server-only";
import axios, { AxiosError } from "axios";
import { storeAction } from "./storeActions";

export type MenuItem = {
  className: string;
  href: string;
  span: string;
  active: boolean;
  eventKey?: string;
};

type MenuResponse = {
  message: string;
  status: number;
  data: MenuItem[];
};

export async function fetchMenu(): Promise<MenuItem[]> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const res = await axios.get<MenuResponse>(`${API_URL}/menu`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    
    return res.data.data ?? [];
  } catch (err: unknown) {
    // Tipado seguro sin any
    const axiosErr = err as AxiosError<{ message?: string }>;
    console.log(
      axiosErr.response?.data?.message ?? axiosErr.message ?? "Error"
    );
    return [];
  }
}
