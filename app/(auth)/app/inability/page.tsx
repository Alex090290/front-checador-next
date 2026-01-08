// import TableInability from "@/components/inability/tableList";
// import InabilityFormView from "@/components/inability/inabilityFormView";
// import InabilityUpdateClient from "@/components/inability/inabilityUpdateClient";

// import { fetchEmployees } from "@/app/actions/employee-actions";
// import type { EmployeeLite } from "@/components/configSystem/formUpdate";

// type Props = {
//   searchParams?: {
//     view_type?: "list" | "form" | "update";
//     id?: string;
//   };
// };

// export default async function Inability({ searchParams }: Props) {
//   const viewType = searchParams?.view_type ?? "list";
//   const idParam = searchParams?.id ?? "null";

//   if (viewType === "list") return <TableInability />;

//   if (viewType === "form") {
//     const raw = await fetchEmployees();

//     const employees: EmployeeLite[] = raw
//       .filter((e) => typeof e.id === "number") // ✅ quita undefined
//       .map((e) => ({
//         _id: e._id,
//         id: e.id as number,
//         name: e.name ?? "",
//         lastName: e.lastName ?? "",
//       }));

//     return <InabilityFormView employees={employees} />;
//   }

//   return <InabilityUpdateClient id={idParam} />;
// }
import LoadingPage from "@/app/LoadingPage";
import React, { lazy, Suspense } from "react";

const InhabilityMainView = lazy(() => import("./views/InhabilityMainView"));

async function PageInahibility({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  return (
    <Suspense fallback={<LoadingPage />}>
      <InhabilityMainView id={id} viewType={viewType} />
    </Suspense>
  );
}

export default PageInahibility;
