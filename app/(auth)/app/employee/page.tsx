export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllEmployees from "./views/ListAllEmployees";


type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  idDepartment?: string;
  idPosition?: string;
  branch?: string;
};


async function PageEmployee({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const id = params?.id ?? "null";

  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";
  const search = params?.search ?? "";
  const idDepartment = params?.idDepartment ?? "";
  const idPosition = params?.idPosition ?? "";
  const branch = params?.branch ?? "";
  // const { view_type: viewType, id } = await searchParams;

  return (

    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAllEmployees id={id} limit={limit} page={page} search={search} idDepartment={idDepartment} idPosition={idPosition} branch={branch} />
    </Suspense>
  );
}

export default PageEmployee;
