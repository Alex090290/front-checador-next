"use server"

import { FetchUsersArgs } from "@/lib/constancy/interface";
import { INewSalary, ISalariesEmployees } from "@/lib/salaries/interface";
import { storeAction } from "./storeActions";
import axios from "axios";
import { ActionResponse } from "@/lib/definitions";
import { revalidatePath } from "next/cache";

export async function salariesQueries(args: FetchUsersArgs & {
    search?: string;
    idEmployee?: number;
    idDepartment?: string;
    idPosition?: string;
    branch?: string;
} = {}): Promise<{
    data: ISalariesEmployees[];
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
        if (args.idEmployee !== undefined && !Number.isNaN(Number(args.idEmployee))) {
            params.set("idEmployee", String(args.idEmployee));
        }
        if (args.idDepartment !== undefined && !Number.isNaN(Number(args.idDepartment))) {
            params.set("idDepartment", String(args.idDepartment));
        }
        if (args.idPosition !== undefined && !Number.isNaN(Number(args.idPosition))) {
            params.set("idPosition", String(args.idPosition));
        }
        if (args.branch !== undefined && !Number.isNaN(Number(args.branch))) {
            params.set("branch", String(args.branch));
        }

        const response = await axios
            .get(`${API_URL}/employee-salary?${params.toString()}`, {
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
            data: response.data ?? [],
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

//Actualizar salario
export async function updateSalary({
    data,
}: {
    data: INewSalary;
}): Promise<ActionResponse<boolean | null>> {

    try {

        const { apiToken, API_URL } = await storeAction();
        await axios.put(
            `${API_URL}/employee-salary`,
            {
               salary: data.salary,
               idsEmployees: data.idsEmployees
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        revalidatePath("/app/salaries");

        return {
            success: true,
            message: "Salario actualizado",
            data: true,
        };
    } catch (error: unknown) {
        console.log(error);

        let message = "Error en la respuesta";

        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return {
            success: false,
            message,
            data: null,
        };
    }
}