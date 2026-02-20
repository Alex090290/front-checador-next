import { fetchEmployees } from "@/app/actions/employee-actions";
import Loading from "@/components/LoadingSpinner";
import CreateVacationComponent from "@/components/vacations/CreateVacation";
import { Suspense } from "react";


export default async function CreateVacation() {
      
      const [ employeesRes ] = await Promise.all([
        fetchEmployees({ page: 1, limit: 500 }),
      ]);
    

  return <>
        <Suspense fallback={<Loading message="Cargando datos..." />}>
            <CreateVacationComponent employees={employeesRes} />
        </Suspense>

  </>
}
