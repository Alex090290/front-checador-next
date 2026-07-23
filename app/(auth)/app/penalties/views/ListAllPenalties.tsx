import { fetchPenaltiesQueries } from "@/app/actions/penalties-actions";
import PenaltiesTableClient from "@/components/penalties/PenaltiesTableClient";
import PenaltyInfoOne from "./PenaltyInfoOne";

export default async function ListAllPenalties({
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
            <PenaltyInfoOne id={id} />
        );
    }
    
    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 2, 1), 100);


    const [penalty] = await Promise.all([
        fetchPenaltiesQueries({
            page: pageParse,
            limit: limitParse,
            search: search,
        }),
    ]);

    return (
        <PenaltiesTableClient
            total={penalty.total}
            page={pageParse}
            limit={limitParse}
            search={search}
            penalty={penalty.data ?? []}
        />
    );
}
