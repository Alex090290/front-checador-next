"use server"

import {
    IVisitor,
    IVisitorCompanySuggestion,
    IVisitorNameSuggestion,
    IVisitorsQuery,
} from "@/lib/visitors/interface";
import { base64ToBlob } from "@/lib/helpers";
import { storeAction } from "./storeActions";
import axios from "axios";

function getError(error: unknown) {
    let message = "Error en la respuesta";
    let status: number | null = null;

    if (axios.isAxiosError(error)) {
        status = error.response?.status ?? null;
        const data = error.response?.data;
        // Las firmas se piden como binario: el mensaje de error también llega como binario
        if (data instanceof ArrayBuffer || Buffer.isBuffer(data)) {
            try {
                message = JSON.parse(Buffer.from(data as ArrayBuffer).toString("utf-8"))?.message || message;
            } catch {
                message = error.message || message;
            }
        } else {
            message = data?.message || error.message || message;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    return { message, status };
}

async function authHeaders() {
    const { apiToken, API_URL } = await storeAction();
    return { API_URL, headers: { Authorization: `Bearer ${apiToken}` } };
}

//Listado de visitas y cuántos visitantes siguen dentro
export async function getVisitors(query: IVisitorsQuery): Promise<{
    success: boolean;
    message: string;
    insideNow: number;
    data: IVisitor[];
    total: number;
    page: number;
    limit: number;
}> {
    const pageNum = Math.max(Number(query.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(query.limit ?? 50) || 50, 1), 100);

    try {
        const { API_URL, headers } = await authHeaders();

        const params = new URLSearchParams();
        params.set("status", query.status ?? "todos");
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.dateFrom) params.set("dateFrom", query.dateFrom);
        if (query.dateTo) params.set("dateTo", query.dateTo);

        const response = await axios
            .get(`${API_URL}/visitors?${params.toString()}`, { headers, timeout: 15000 })
            .then((res) => res.data);

        return {
            success: true,
            message: response?.message ?? "OK",
            insideNow: Number(response?.data?.insideNow ?? 0),
            data: response?.data?.rows ?? [],
            total: Number(response?.total ?? 0),
            page: Number(response?.page ?? pageNum),
            limit: Number(response?.limit ?? limitNum),
        };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, message: getError(error).message, insideNow: 0, data: [], total: 0, page: pageNum, limit: limitNum };
    }
}

//Autocompletado de nombres de visitantes que ya vinieron antes
export async function suggestVisitorNames(search: string): Promise<IVisitorNameSuggestion[]> {
    try {
        const { API_URL, headers } = await authHeaders();
        const response = await axios
            .get(`${API_URL}/visitors-suggest/names?search=${encodeURIComponent(search)}`, { headers, timeout: 10000 })
            .then((res) => res.data);

        return Array.isArray(response?.data) ? response.data : [];
    } catch {
        return [];
    }
}

//Autocompletado de empresas
export async function suggestVisitorCompanies(search: string): Promise<IVisitorCompanySuggestion[]> {
    try {
        const { API_URL, headers } = await authHeaders();
        const response = await axios
            .get(`${API_URL}/visitors-suggest/companies?search=${encodeURIComponent(search)}`, { headers, timeout: 10000 })
            .then((res) => res.data);

        return Array.isArray(response?.data) ? response.data : [];
    } catch {
        return [];
    }
}

//Registrar entrada: la hora la pone el back al firmar
export async function registerVisitorEntry({
    name,
    company,
    reason,
    signature,
}: {
    name: string;
    company: string;
    reason: string;
    signature: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        if (!signature) return { success: false, message: "Falta la firma" };

        const { API_URL, headers } = await authHeaders();

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("company", company.trim());
        formData.append("reason", reason.trim());
        formData.append("signature", base64ToBlob(signature, "image/png"), "signature.png");

        const response = await axios
            .post(`${API_URL}/visitors`, formData, { headers, timeout: 30000 })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "Entrada registrada" };
    } catch (error: unknown) {
        console.log(error);
        return { success: false, message: getError(error).message };
    }
}

//Registrar salida. 409 = alguien más ya la registró
export async function registerVisitorExit(id: number, signature: string): Promise<{
    success: boolean;
    message: string;
    statusCode: number | null;
    data?: IVisitor;
}> {
    try {
        if (!signature) return { success: false, message: "Falta la firma", statusCode: 400 };

        const { API_URL, headers } = await authHeaders();

        const formData = new FormData();
        formData.append("signature", base64ToBlob(signature, "image/png"), "signature.png");

        const response = await axios
            .put(`${API_URL}/visitors/${id}/exit`, formData, { headers, timeout: 30000 })
            .then((res) => res.data);

        return { success: true, message: response?.message ?? "Salida registrada", statusCode: 200, data: response?.data };
    } catch (error: unknown) {
        console.log(error);
        const { message, status } = getError(error);
        return { success: false, message, statusCode: status };
    }
}

//Imagen de la firma de entrada o salida (como en las firmas de dispositivos: binario → base64)
export async function getVisitorSignature(id: number, type: "entry" | "exit"): Promise<{
    success: boolean;
    message: string;
    statusCode: number | null;
    data: string | null;
}> {
    try {
        const { API_URL, headers } = await authHeaders();

        const response = await axios.get(`${API_URL}/visitors/${id}/signature/${type}`, {
            headers,
            responseType: "arraybuffer",
            timeout: 15000,
        });

        const contentType = String(response.headers["content-type"] ?? "image/png").split(";")[0];
        const base64 = Buffer.from(response.data, "binary").toString("base64");

        return { success: true, message: "OK", statusCode: 200, data: `data:${contentType};base64,${base64}` };
    } catch (error: unknown) {
        const { message, status } = getError(error);
        return { success: false, message, statusCode: status, data: null };
    }
}
