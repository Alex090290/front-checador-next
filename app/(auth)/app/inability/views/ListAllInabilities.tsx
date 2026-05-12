import { fetchEmployees } from "@/app/actions/employee-actions";
import { getAllInability, getOneInability } from "@/app/actions/inability-actions";
import TableInabilityComponent from "@/components/inability/tableList";
import InfoOneInability from "@/components/inability/inabilityInfoOne";

export default async function ListAllInability({
  id,
  page = "1",
  limit = "20"
}: {
  id: string;
  page?: string;
  limit?: string;
}) {
  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 500);

  if (id && id !== "null") {
    const [inhability, employees] = await Promise.all([
        getOneInability(Number(id)),
        fetchEmployees({ page: pageParse, limit: limitParse }),
      ]);
    return <InfoOneInability inhability={inhability} employees={employees.data} id={id} />;
  }

  const inhabilities = await getAllInability({ page: pageParse, limit: limitParse });

  return <TableInabilityComponent 
            inhabilities={inhabilities.data}
            total={inhabilities.total}
            page={pageParse}
            limit={limitParse}
        />
}