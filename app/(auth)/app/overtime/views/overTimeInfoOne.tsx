import { fetchEmployees } from "@/app/actions/employee-actions";
import { findOvertimeById } from "@/app/actions/overtime-actions";
import { OvertimeOne } from "@/components/overtime/overtimeInfoOne";

export default async function OverTimeInfoOne ({ id }: { id: string }) {
    const [overtime, employeesResponse] = await Promise.all([
        findOvertimeById({ id: Number(id) }),
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

    return <OvertimeOne overtime={overtime} employees={employees} />;
}