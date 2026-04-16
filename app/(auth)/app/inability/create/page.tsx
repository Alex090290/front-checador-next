export const dynamic = "force-dynamic";

import { fetchEmployees } from "@/app/actions/employee-actions";
import CreateInabilityComponent from "@/components/inability/createInability";

export default async function CreateInabilityPage() {
  const employees = await fetchEmployees({ page: 1, limit: 500 });

  return <CreateInabilityComponent employees={employees.data} />;
}