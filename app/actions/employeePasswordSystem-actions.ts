"use server"

import { storeAction } from "./storeActions";
import axios from "axios";

function getErrorMessage(error: unknown) {
    let message = "Error en la respuesta";

    if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return message;
}

//Estado de la contraseña del sistema del empleado con sesión (de /me)
export async function getPasswordSystemStatus(): Promise<{
    success: boolean;
    isEmployee: boolean;
    passwordSystemPending: boolean;
    idCheck: number | null;
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const me = await axios
            .get(`${API_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
                timeout: 15000,
            })
            .then((res) => res.data?.data);

        return {
            success: true,
            isEmployee: me?.sessionType === "employee",
            passwordSystemPending: me?.passwordSystemPending === true,
            idCheck: me?.idCheck ?? null,
        };
    } catch (error: unknown) {
        console.log(getErrorMessage(error));
        return { success: false, isEmployee: false, passwordSystemPending: false, idCheck: null };
    }
}

//El empleado con sesión crea (con su NIP) o cambia (con su contraseña actual) su contraseña del sistema
export async function changePasswordSystem({
    currentPassword,
    newPassword,
    confirmPassword,
}: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .put(
                `${API_URL}/employee-password-system`,
                { currentPassword, newPassword, confirmPassword },
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
                    timeout: 15000,
                }
            )
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "Contraseña guardada" };
    } catch (error: unknown) {
        // Sin el body: lleva contraseñas
        return { success: false, message: getErrorMessage(error) };
    }
}

//Administración: borra la contraseña del sistema; el empleado vuelve a entrar con su NIP
export async function resetPasswordSystem(idEmployee: number): Promise<{ success: boolean; message: string }> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .put(`${API_URL}/employee-password-system/reset/${idEmployee}`, {}, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
                timeout: 15000,
            })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "Contraseña reiniciada" };
    } catch (error: unknown) {
        console.log(getErrorMessage(error));
        return { success: false, message: getErrorMessage(error) };
    }
}
