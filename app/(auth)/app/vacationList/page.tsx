import ListVacationsAll from "@/app/(auth)/app/vacationList/views/ListVacations";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";

// app/(auth)/app/vacationList
type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  dateInit?: string;
  dateEnd?: string;
};

export default function PageVacations({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const id = searchParams.id!
  const page = searchParams.page ?? "1";
  const limit = searchParams.limit ?? "20";
  const search = searchParams.search ?? "";
  const dateInit = searchParams.dateInit ?? "";
  const dateEnd = searchParams.dateEnd ?? "";
    
  return (
        <Suspense fallback={<Loading message="Cargando datos..." />}>
           <ListVacationsAll id={id} limit={limit} page={page} search={search} dateInit={dateInit} dateEnd={dateEnd}/>
        </Suspense>

  );
}
 