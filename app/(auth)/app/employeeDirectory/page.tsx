export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllEmployeeDirectory from "./views/ListAllEmployeeDirectory";


type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  idDepartment?: string;
  branch?: string;
};


async function PageEmployeeDirectory({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";
  const search = params?.search ?? "";
  const idDepartment = params?.idDepartment ?? "";
  const branch = params?.branch ?? "";

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAllEmployeeDirectory limit={limit} page={page} search={search} idDepartment={idDepartment} branch={branch} />
    </Suspense>
  );
}

export default PageEmployeeDirectory;
