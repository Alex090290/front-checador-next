import { findConstancyById } from "@/app/actions/constancy-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { ConstancyOne } from "@/components/constancy/ConstancyInfoOne";


export default async function ConstancyInfoOne({ id }: { id: string }) {


    const [constancy, employees] = await Promise.all([
        findConstancyById({ id: Number(id) }),
        fetchEmployees({ page: 1, limit: 500 }),
    ]);

    return (
        <ConstancyOne
            constancy={constancy}
            employees={
                (employees.data ?? []).map((e) => ({
                    _id: e._id,
                    id: e.id!,
                    name: e.name ?? "",
                    lastName: e.lastName ?? "",
                }))
            }
        />
    )
}