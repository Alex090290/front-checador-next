import { fetchConstancies } from "@/app/actions/constancy-actions";
import { findConstancyById } from "@/app/actions/constancy-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { ConstancyOne } from "@/components/constancy/ConstancyInfoOne";

export default async function ConstancyInfoOne({ id }: { id: string }) {
    const [constancy, employeesResponse] = await Promise.all([
        findConstancyById({ id: Number(id) }),
        // fetchConstancies({ page: 1, limit: 500 }),
        fetchEmployees({ page: 1, limit: 500 }),
    ]);

    const employees = (employeesResponse.data ?? []).map((e) => ({
        _id: e._id,
        id: e.id!,
        name: e.name ?? "",
        lastName: e.lastName ?? "",
    }));

    console.log("EMPLOYEESRES: ", employeesResponse)

    return <ConstancyOne constancy={constancy} employees={employees} />;
}