import { fetchConstanciesQueries } from "@/app/actions/constancy-actions";
import ConstanciesTableClient from "@/components/constancy/ConstanciesTableList";
import ConstancyInfoOne from "./constancyInfoOne";

export default async function ListAllConstancies({
    id,
    page = "1",
    limit = "20",
}: {
    id: string;
    page?: string;
    limit?: string;
}) {
    if (id && id !== "null") {
        return <ConstancyInfoOne id={id} />;
    }

    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

    const [constancies] = await Promise.all([
        fetchConstanciesQueries({
            page: pageParse,
            limit: limitParse,
        }),
    ]);

    return (
        <ConstanciesTableClient
            total={constancies.total}
            page={pageParse}
            limit={limitParse}
            constancies={constancies.data}
        />
    );
}