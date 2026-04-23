export const dynamic = "force-dynamic";
import { Suspense } from "react";
import ListAttendanceAll from "./views/ListReportAll";
import Loading from "@/components/LoadingSpinner";

type SearchParams = {
  id?: string;
  year?: string;
  page?: string;
  limit?: string;
};


export default async function PageAttendanceReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const id = params?.id ?? "null";
  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";
  const year = params?.year ?? "2026";

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAttendanceAll year={year} id={id} limit={limit} page={page} />
    </Suspense>
  );
}