import ListVacationsAll from "@/app/(auth)/app/vacationList/views/ListVacations";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";

// app/(auth)/app/vacationList
type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};

export default function PageVacations({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const id = searchParams?.id ?? "null";
  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";
    
  return (
        <Suspense fallback={<Loading message="Cargando datos..." />}>
           <ListVacationsAll id={id} limit={limit} page={page} />
        </Suspense>

  );
}
 