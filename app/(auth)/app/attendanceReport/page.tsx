import ListAttendanceAll from "./views/ListReportAll";

type SearchParams = {
  view_type?: string;
  id?: string;
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
    
  return (
    <ListAttendanceAll id={id} limit={limit} page={page} />
  );
}
 