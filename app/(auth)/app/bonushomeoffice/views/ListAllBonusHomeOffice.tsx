import { listAllBonusHO } from "@/app/actions/bonusHO-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import TableBonusHO from "@/components/BonusHomeOffice/BonusHOTableClient";

export default async function ListAllBonusHomeOffice() {

    const [BonusHomeOffice, employees] = await Promise.all ([
        listAllBonusHO(),
        fetchEmployees({page: 1, limit: 500})
    ]);

    return (
        <TableBonusHO
            BonusHomeOffice={BonusHomeOffice}
            employees={employees.data}
        />
    )
}
