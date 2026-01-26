import ListVacationsAll from "@/app/(auth)/app/vacationList/views/ListVacations";

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

  // 👇 lo mandamos tal como strings (para no pelear con typings)
  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";
    
  return (
    <ListVacationsAll id={id} limit={limit} page={page} />
  );
}
 