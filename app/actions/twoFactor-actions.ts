"use server";

import { ActionResponse, ITwoFactorSetup } from "@/lib/definitions";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { storeAction } from "./storeActions";
import { unstable_update } from "@/lib/auth";

function getErrorMessage(error: unknown) {
    let message = "Error en la respuesta";

    if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return message;
}

//Generar QR de verificación en dos pasos (todavía no la activa)
export async function setupTwoFactor(): Promise<ActionResponse<ITwoFactorSetup>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.post(`${API_URL}/users/2fa/setup`, {},
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        return {
            success: true,
            message: res.data?.message || "Código QR generado",
            data: res.data?.data,
        };
    } catch (error: unknown) {
        console.log(error);

        return {
            success: false,
            message: getErrorMessage(error),
        };
    }
}

//Activar verificación en dos pasos con el código de la app
export async function enableTwoFactor({
    code,
}: {
    code: string;
}): Promise<ActionResponse<{ twoFactorEnabled: boolean }>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.post(`${API_URL}/users/2fa/enable`,
            {
                code: String(code),
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/users/profile");

        return {
            success: true,
            message: res.data?.message || "Verificación en dos pasos activada",
            data: res.data?.data,
        };
    } catch (error: unknown) {
        console.log(error);

        return {
            success: false,
            message: getErrorMessage(error),
        };
    }
}

//Verificar el código al iniciar sesión (con el token pendiente del login)
export async function verifyTwoFactor({
    code,
}: {
    code: string;
}): Promise<ActionResponse<{ requireLogin: boolean }>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.post(`${API_URL}/users/2fa/verify`,
            {
                code: String(code),
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        const newToken = res.data?.data;

        if (!newToken) {
            return {
                success: false,
                message: "No se recibió la sesión, vuelve a iniciar sesión",
                data: { requireLogin: true },
            };
        }

        // Reemplaza el token temporal del login; la sesión se refresca con /me (ver jwt en lib/auth.ts)
        const session = await unstable_update({ user: { apiToken: String(newToken) } });

        if (!session?.user || session.user.twoFactorPending) {
            return {
                success: false,
                message: "No se pudo completar la verificación, vuelve a iniciar sesión",
                data: { requireLogin: true },
            };
        }

        return {
            success: true,
            message: res.data?.message || "Verificación completada",
            data: { requireLogin: false },
        };
    } catch (error: unknown) {
        console.log(error);

        // 401: el token del login venció o la 2FA ya no está activa → volver al login
        const requireLogin = axios.isAxiosError(error) && error.response?.status === 401;

        return {
            success: false,
            message: getErrorMessage(error),
            data: { requireLogin },
        };
    }
}

//Desactivar verificación en dos pasos con el código de la app
export async function disableTwoFactor({
    code,
}: {
    code: string;
}): Promise<ActionResponse<{ twoFactorEnabled: boolean }>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.post(`${API_URL}/users/2fa/disable`,
            {
                code: String(code),
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/users/profile");

        return {
            success: true,
            message: res.data?.message || "Verificación en dos pasos desactivada",
            data: res.data?.data,
        };
    } catch (error: unknown) {
        console.log(error);

        return {
            success: false,
            message: getErrorMessage(error),
        };
    }
}

//Reiniciar la verificación en dos pasos de otro usuario (admin)
export async function resetTwoFactor({
    id,
}: {
    id: number;
}): Promise<ActionResponse<{ id: number; twoFactorEnabled: boolean }>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.put(`${API_URL}/users/2fa/reset/${id}`, {},
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/users");

        return {
            success: true,
            message: res.data?.message || "Verificación en dos pasos reiniciada",
            data: res.data?.data,
        };
    } catch (error: unknown) {
        console.log(error);

        return {
            success: false,
            message: getErrorMessage(error),
        };
    }
}

//Reiniciar la verificación en dos pasos de un empleado (admin)
export async function resetEmployeeTwoFactor({
    id,
}: {
    id: number;
}): Promise<ActionResponse<{ id: number; twoFactorEnabled: boolean }>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.put(`${API_URL}/employee/2fa/reset/${id}`, {},
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/employee");

        return {
            success: true,
            message: res.data?.message || "Verificación en dos pasos reiniciada",
            data: res.data?.data,
        };
    } catch (error: unknown) {
        console.log(error);

        return {
            success: false,
            message: getErrorMessage(error),
        };
    }
}
