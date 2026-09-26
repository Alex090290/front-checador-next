import { listAllBonusKeys } from "@/app/actions/bonusKeys-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import BonusTableClient from "@/components/bonusKeys/BonusTableClient";

export default async function ListAllBonuskeys({
    search
}: {
    search?: string;
}) {

    const [bonuskeys, employees] = await Promise.all([
        listAllBonusKeys({search}),
        fetchEmployees({ page: 1, limit: 500 })
    ]);

    return (
        <BonusTableClient
            bonuskeys={bonuskeys.data}
            employees={employees.data}
            total={bonuskeys.total}
            search={search}
        />

    )
}