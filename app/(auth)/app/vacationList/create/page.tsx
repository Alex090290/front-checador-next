import { fetchEmployees } from "@/app/actions/employee-actions";
import { fetchVacations } from "@/app/actions/vacations-actions";
import Loading from "@/components/LoadingSpinner";
import CreateVacationComponent from "@/components/vacations/CreateVacation";
import { Employee, Vacations } from "@/lib/definitions";
import { Suspense } from "react";


export default async function CreateVacation() {

      let employees: Employee[] = [];
    
      const [employeesRes] = await Promise.all([
        fetchEmployees(),
      ]);
    
      employees = employeesRes;

  return <>
        <Suspense fallback={<Loading message="Cargando datos..." />}>
            <CreateVacationComponent employees={employeesRes} />
        </Suspense>

  </>
}
