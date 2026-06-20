import { fetchEmployees } from "@/app/actions/employee-actions";
import CreateOvertimeComponent from "@/components/overtime/CreateOvertime";

export const dynamic = 'force-dynamic';

export default async function CreateOvertimePage() {
    const employees = await fetchEmployees({
        limit: 500,
        search: "",
    });
    

    return (
        <CreateOvertimeComponent employees={employees.data ?? []} />
    );
} 