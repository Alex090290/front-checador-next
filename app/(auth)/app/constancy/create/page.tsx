import CreateConstancyComponent from "@/components/constancy/CreateConstancy";
import ListAllEmployees from "../../employee/views/ListAllEmployees";

export default async function CreateConstancyPage() {

    //Para poder mandar traer la lista de empleados a la hora de hacewr una constancia
    const employees = await ListAllEmployees({
        id?: string;
        page?: string;
        limit?: string;
        search?: string;
    });

    return <CreateConstancyComponent employees={employees.data ?? []} />;
}