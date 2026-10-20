export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListReportsParticipation from "./views/ListReportsParticipation";


type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  idDepartment?: string;
  branch?: string;
  participation?: string;
};


async function PageReportsParticipation({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListReportsParticipation
        page={params?.page ?? "1"}
        limit={params?.limit ?? "50"}
        search={params?.search ?? ""}
        idDepartment={params?.idDepartment ?? ""}
        branch={params?.branch ?? ""}
        participation={params?.participation ?? "todos"}
      />
    </Suspense>
  );
}

export default PageReportsParticipation;
