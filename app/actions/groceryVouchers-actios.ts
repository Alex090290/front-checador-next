import { IGroceryVouchers } from "@/lib/groceryVouchers/interface";
import { storeAction } from "./storeActions";
import axios from "axios";

//Listar Vales general 
type FetchGroceryVouchersArgs = {
    idEmployee?: string;
    idPeriod?: string | number;
    page?: number | string;
    limit?: number | string;
    search?: string;
};

export async function fetchGroceryVouchers(
    args: FetchGroceryVouchersArgs = {}
): Promise<{
    data: IGroceryVouchers[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}> {
    const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);
    const empty = { data: [], total: 0, page: 1, limit: limitNum, pages: 1 };

    if (args.idPeriod === undefined || args.idPeriod === null || args.idPeriod === "") {
        return empty;
    }

    try {
        const { apiToken, API_URL } = await storeAction();

        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", String(limitNum));

        if (args.search?.trim()) params.set("search", args.search.trim());

        const res = await axios.get(
            `${API_URL}/incidences/vales/${String(args.idPeriod)}?${params.toString()}`,
            { headers: { Authorization: `Bearer ${apiToken}` } }
        );

        const response = res.data;
        const total = Number(response.total ?? 0);
        const pages = Math.max(Math.ceil(total / limitNum), 1);

        return {
            data: response.data ?? [], // ajusta según la forma real de tu API (punto 5)
            total,
            page: pageNum,
            limit: limitNum,
            pages,
        };
    } catch (err: unknown) {
        console.log(err);
        return empty;
    }
}

//Listar un solo registro
