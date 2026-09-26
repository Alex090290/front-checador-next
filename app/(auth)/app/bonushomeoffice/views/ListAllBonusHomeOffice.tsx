import { listAllBonusHO } from "@/app/actions/bonusHO-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import TableBonusHO from "@/components/BonusHomeOffice/BonusHOTableClient";

export default async function ListAllBonusHomeOffice({
    search
}: {
    search?: string;
}) {

    const [BonusHomeOffice, employees] = await Promise.all([
        listAllBonusHO({ search }),
        fetchEmployees({ page: 1, limit: 500 })
    ]);

    return (
        <TableBonusHO
            BonusHomeOffice={BonusHomeOffice.data}
            employees={employees.data}
            total={BonusHomeOffice.total}
            search={search}
        />
    )
}
