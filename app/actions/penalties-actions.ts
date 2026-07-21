import { ActionResponse } from "@/lib/definitions";
import { IPenaltyAxios, IPenaltyForOffeses } from "@/lib/penalties/interface";
import { storeAction } from "./storeActions";
import { auth } from "@/lib/auth";
import axios from "axios";
import { FetchUsersArgs } from "@/lib/constancy/interface";

//Funcion para crear penalizacion
export async function createPenalty({
    data,
}: {
    data: IPenaltyForOffeses;
}): Promise<ActionResponse<IPenaltyAxios>> {

    try {
        const { API_URL } = await storeAction();
        const session = await auth();
        const apiToken = session?.user?.apiToken;

        const dataSave = {
            idEmployee: data.idEmployee,
            idsAbsencesAndAttendances: data.absencesAndAttendances,
            PenaltyForOffensesType: data.type,
            dateOfAbsence: data.dateOfAbsence,
            motive: data.motive,
        }

        const headers = {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        }


        try {
            const res = await axios.post<{ data: IPenaltyAxios }>(
                `${API_URL}/penalties`,
                dataSave,
                headers
            );

            const dataResponse: IPenaltyAxios = {
                _id: res.data.data._id,
                id: res.data.data.id,
            };

            return {
                success: true,
                message: "Registro creado correctamente",
                data: dataResponse,
            };
        } catch (err) {
            const error = err as Error;
            return {
                success: false,
                message: error.message ? error.message : "Error en endpoint",
            };
        }
    } catch (error: unknown) {

        const err = error as Error;

        return {
            success: false,
            message: err.message

        };
    }
}

//Funcio para paginar y listar penalizaciones
export async function fetchPenaltiesQueries(args: FetchUsersArgs & {
    search?: string;
    idEmployee?: number;
    dateInit?: string;
    dateEnd?: string;
    type?: string;

} = {}): Promise<{
    data: IPenaltyForOffeses[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}> {
    try {
        const { apiToken, API_URL } = await storeAction();

        const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
        const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);

        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));

        if (args.search?.trim()) {
            params.set("search", args.search.trim());
        }

        const response = await axios
            .get(`${API_URL}/penaltyForOffeses?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(
                    err.response.data.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        const total = Number(response.total ?? 0);
        const pages = Math.max(Math.ceil(total / limitNum), 1);

        return {
            data: response.data?.data ?? [],
            total,
            page: pageNum,
            limit: limitNum,
            pages,
        };

    } catch (error) {
        console.log(error);
        return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
    }
}

//Funcion para listar una penalizacion
export async function findAbsence({
    id,
}: {
    id?: number | null;
}): Promise<IPenaltyForOffeses | null> {

    try {
        if (!id || id <= 0) return null;

        const { apiToken, API_URL } = await storeAction();

        const response = await axios
            .get(`${API_URL}/penaltyForOffesesOne/${id}`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            })

            .then((res) => {
                console.log("Respuesta correcta: ", res.data);
                return res.data;
            })

            .catch((err) => {
                console.log("Respuesta incorrecta: ", err);

                throw new Error(
                    err.response.data.message
                        ? err.response.data.message
                        : "Error en la respuesta"
                );
            });

        return response.data?.data ?? response.data ?? null;

    } catch (error) {

        console.log(error);
        return null;
    }
}

