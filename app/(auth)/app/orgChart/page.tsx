export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListOrgChart from "./views/ListOrgChart";


type SearchParams = {
  idDepartment?: string;
};


async function PageOrgChart({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const idDepartment = params?.idDepartment ?? "";

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListOrgChart idDepartment={idDepartment} />
    </Suspense>
  );
}

export default PageOrgChart;
