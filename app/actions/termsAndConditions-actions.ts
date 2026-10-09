"use server"

import { ActionResponse } from "@/lib/definitions";
import {
    ITermsAndConditions,
    ITermsAndConditionsForm,
    TLegalDocumentType,
} from "@/lib/termsAndConditions/interface";
import { storeAction } from "./storeActions";
import axios from "axios";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown) {
    let message = "Error en la respuesta";

    if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return message;
}

//Listar documentos legales (sin content ni history)
export async function getTermsList(
    page: number = 1,
    limit: number = 20,
    type?: TLegalDocumentType | "",
    search?: string
): Promise<{
    data: ITermsAndConditions[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const pageNum = Math.max(Number(page ?? 1) || 1, 1);
        const limitNum = Math.min(Math.max(Number(limit ?? 20) || 20, 1), 100);

        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));
        if (type) params.set("type", type);
        if (search?.trim()) params.set("search", search.trim());

        const response = await axios
            .get(`${API_URL}/termsAndConditions/listAll?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })
            .then((res) => res.data);

        const total = Number(response.total ?? 0);
        const pages = Math.max(Math.ceil(total / limitNum), 1);

        return {
            data: response.data ?? [],
            total,
            page: pageNum,
            limit: limitNum,
            pages,
        };
    } catch (error: unknown) {
        console.log(getErrorMessage(error), error);
        return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
    }
}

//Buscar un documento completo (con content y history)
export async function getTermsById(id: number): Promise<ActionResponse<ITermsAndConditions>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.get(`${API_URL}/termsAndConditions/${id}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        return {
            success: true,
            message: res.data?.message || "OK",
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

//Crear documento legal
export async function createTerms(form: ITermsAndConditionsForm): Promise<ActionResponse<ITermsAndConditions>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.post(`${API_URL}/termsAndConditions`,
            {
                type: form.type,
                title: form.title,
                content: form.content,
                isActive: form.isActive === true,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/termsAndConditionsAdmin");

        return {
            success: true,
            message: res.data?.message || "Documento creado correctamente",
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

//Actualizar documento legal (title, content y/o isActive; el type no se puede cambiar)
export async function updateTerms(
    id: number,
    partialForm: Partial<Pick<ITermsAndConditionsForm, "title" | "content" | "isActive">>
): Promise<ActionResponse<{ conflict: boolean }>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.put(`${API_URL}/termsAndConditions/${id}`,
            partialForm,
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

        revalidatePath("/app/termsAndConditionsAdmin");

        return {
            success: true,
            message: res.data?.message || "Documento actualizado correctamente",
            data: { conflict: false },
        };
    } catch (error: unknown) {
        console.log(error);

        // 409: otro administrador lo guardó al mismo tiempo
        const conflict = axios.isAxiosError(error) && error.response?.status === 409;

        return {
            success: false,
            message: getErrorMessage(error),
            data: { conflict },
        };
    }
}

//Eliminar documento legal (no se puede eliminar el vigente)
export async function deleteTerms(id: number): Promise<ActionResponse<boolean>> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const res = await axios.delete(`${API_URL}/termsAndConditions/${id}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        revalidatePath("/app/termsAndConditionsAdmin");

        return {
            success: true,
            message: res.data?.message || "Documento eliminado correctamente",
        };
    } catch (error: unknown) {
        console.log(error);

        return {
            success: false,
            message: getErrorMessage(error),
        };
    }
}

//Documento publicado (PÚBLICO, sin token). Un 404 significa que no hay publicado: data = null
export async function getPublicTerms(
    type: "terminos" | "privacidad"
): Promise<ActionResponse<ITermsAndConditions | null>> {
    try {
        const { API_URL } = await storeAction();

        const res = await axios.get(`${API_URL}/termsAndConditions/public/${type}`);

        return {
            success: true,
            message: res.data?.message || "OK",
            data: res.data?.data ?? null,
        };
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return {
                success: true,
                message: error.response?.data?.message || "Sin documento publicado",
                data: null,
            };
        }

        console.log(error);

        return {
            success: false,
            message: getErrorMessage(error),
        };
    }
}
