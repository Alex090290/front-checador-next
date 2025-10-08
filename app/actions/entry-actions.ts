"use server";

import { ActionResponse } from "@/lib/definitions";
import axios, { AxiosResponse } from "axios";

const API_URL = process.env.API_URL;

export async function getWelcome(): Promise<ActionResponse<AxiosResponse>> {
  try {
    const response = await axios.get(`${API_URL}/welcome`);

    return {
      success: true,
      message: response.data.status,
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
