import React from "react";
import InhabilityListView from "./InhabilityListView";
import InhabilityFormView from "./InhabilityFormView";
import NotFound from "@/app/not-found";
import { Employee, IInability } from "@/lib/definitions";
import {
  getAllInability,
  getOneInability,
} from "@/app/actions/inability-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";

async function InhabilityMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let inhability: IInability | null = null;


  if (id && id !== "null") {
    inhability = await getOneInability(Number(id));
  }

  const [inhabilities, employees] = await Promise.all([
    getAllInability(),
    fetchEmployees(),
  ]);

  if (viewType === "list") {
    return <InhabilityListView inhabilities={inhabilities.data.reverse()} />;
  } else if (viewType === "form") {
    return (
      <InhabilityFormView
        employees={employees.data}
        inhability={inhability}
        id={id}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default InhabilityMainView;
