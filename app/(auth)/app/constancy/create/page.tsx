import CreateConstancyComponent from "@/components/constancy/CreateConstancy";
import { fetchEmployees } from "@/app/actions/employee-actions";

export const dynamic = 'force-dynamic';

export default async function CreateConstancyPage() {

    //Para poder mandar traer la lista de empleados a la hora de hacer una constancia
    const employees = await fetchEmployees({
    limit: 500,
    search: "",
  });

  return (
    <CreateConstancyComponent employees={employees.data ?? []} />
  );
}