import ListAttendanceAll from "./views/ListReportAll";

type SearchParams = {
  id?: string;
  year?: string;
  page?: string;
  limit?: string;
};

export default function PageAttendanceReport({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const id = searchParams?.id ?? "null";

  // 👇 lo mandamos tal como strings (para no pelear con typings)
  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";
  const year = searchParams?.year ?? "2026";
    
  return (
    <ListAttendanceAll year={year} id={id} limit={limit} page={page} />
  );
}
 