import { fetchConstanciesQueries } from "@/app/actions/constancy-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import ConstanciesTableClient from "@/components/constancy/ConstanciesTableList";

export default async function ListAllConstancies({
    id,
    page = "1",
    limit = '20',

}: {
    id: string;
    page?: string;
    limit?: string;
}) {
    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

    const [constancies, employeesResponse] = await Promise.all([
        fetchConstanciesQueries({
            page: pageParse,
            limit: limitParse
        }),
        fetchEmployees({
            page: 1,
            limit: 500,
        }),
    ]);

    return (
        <ConstanciesTableClient
            total={constancies.total}
            page={pageParse}
            limit={limitParse}
            constancies={constancies.data}
            employees={
                (employeesResponse.data ?? [])
                    .filter((e) => e.id !== undefined)
                    .map((e) => ({
                        _id: e._id,
                        id: e.id!,
                        name: e.name ?? "",
                        lastName: e.lastName ?? "",
                    }))
            }
        />
    )
}