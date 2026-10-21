"use server"

import { IBasePermissionsData, IEmployeePermissionsData } from "@/lib/employeePermissions/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

type SaveResult = { success: boolean; message: string; unknown: string[] };

function getError(error: unknown) {
    let message = "Error en la respuesta";
    let unknown: string[] = [];

    if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || message;
        unknown = error.response?.data?.data?.unknown ?? [];
    } else if (error instanceof Error) {
        message = error.message;
    }

    return { message, unknown };
}

async function authHeaders() {
    const { apiToken, API_URL } = await storeAction();
    return { API_URL, headers: { Authorization: `Bearer ${apiToken}` } };
}

//Permisos base, cuántos empleados activos no los tienen completos y el catálogo
export async function getBasePermissions(): Promise<{ success: boolean; message: string; data: IBasePermissionsData | null }> {
    try {
        const { API_URL, headers } = await authHeaders();
        const response = await axios
            .get(`${API_URL}/employee-base-permissions`, { headers, timeout: 15000 })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "OK", data: response?.data ?? null };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, message: getError(error).message, data: null };
    }
}

//Reemplaza la lista de permisos base (se mandan todos los marcados)
export async function updateBasePermissions(permissions: string[]): Promise<SaveResult> {
    try {
        const { API_URL, headers } = await authHeaders();
        const response = await axios
            .put(`${API_URL}/employee-base-permissions`, { permissions }, { headers, timeout: 15000 })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "Permisos base guardados", unknown: [] };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, ...getError(error) };
    }
}

//Agrega a cada empleado activo los permisos base que le falten (no quita ninguno)
export async function applyBasePermissions(): Promise<{ success: boolean; message: string }> {
    try {
        const { API_URL, headers } = await authHeaders();
        const response = await axios
            .post(`${API_URL}/employee-base-permissions/apply`, {}, { headers, timeout: 60000 })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "Permisos base aplicados" };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, message: getError(error).message };
    }
}

//Permisos de un empleado y la lista base (para marcar cuáles son base)
export async function getEmployeePermissions(idEmployee: number): Promise<{
    success: boolean;
    message: string;
    data: IEmployeePermissionsData | null;
}> {
    try {
        const { API_URL, headers } = await authHeaders();
        const response = await axios
            .get(`${API_URL}/employee-permissions/${idEmployee}`, { headers, timeout: 15000 })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "OK", data: response?.data ?? null };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, message: getError(error).message, data: null };
    }
}

//Reemplaza los permisos de un empleado (aplica desde su siguiente petición)
export async function updateEmployeePermissions(idEmployee: number, permissions: string[]): Promise<SaveResult> {
    try {
        const { API_URL, headers } = await authHeaders();
        const response = await axios
            .put(`${API_URL}/employee-permissions/${idEmployee}`, { permissions }, { headers, timeout: 15000 })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "Permisos del empleado guardados", unknown: [] };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, ...getError(error) };
    }
}

