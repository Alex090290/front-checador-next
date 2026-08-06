// import LoadingPage from "@/app/LoadingPage";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import EventosMainView from "./views/EventosMainView";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  idUser?: string;
  date?: string;
};

async function PageEventos({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const id = params?.id ?? "null";
  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";
  const search = params?.search ?? "";
  const idUser = params?.idUser ?? ""; 
  const date = params?.date ?? "";

  return (

    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <EventosMainView id={id} limit={limit} page={page} search={search} idUser={idUser} date={date}/>
    </Suspense>

  );
}

export default PageEventos;
