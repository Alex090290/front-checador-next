import { listAllBonusKeys } from "@/app/actions/bonusKeys-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import BonusTableClient from "@/components/bonusKeys/BonusTableClient";

export default async function ListAllBonuskeys() {

    const [bonuskeys, employees ] = await Promise.all ([
        listAllBonusKeys(), 
        fetchEmployees({page: 1, limit: 500})
    ]);

    return (
        <BonusTableClient
            bonuskeys={bonuskeys}
            employees={employees.data}
        />
    )
}