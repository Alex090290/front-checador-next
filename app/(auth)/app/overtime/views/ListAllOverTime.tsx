import { fetchOverTimeQueries } from "@/app/actions/overtime-actions";
import OverTimeTableClient from "@/components/overtime/overTimeTableList";
import OverTimeInfoOne from "./overTimeInfoOne";

export default async function ListAllOverTime({
    id,
    page = "1",
    limit = "20",
    search = "", 
}: {
        id: string;
        page?: string;
        limit?: string;
        search?: string;
    }) {
    if (id && id !== "null") {
    return (
        <OverTimeInfoOne id={id} />
    );
}

    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 2, 1), 100)

    const [overTime] = await Promise.all([
        fetchOverTimeQueries({
            page: pageParse,
            limit: limitParse,
            search
        }),
    ]);

    return (
        <OverTimeTableClient
            total={overTime.total}
            page={pageParse}
            limit={limitParse}
            overtime={overTime.data} />
    )
}