// import LoadingPage from "@/app/LoadingPage";
// import { lazy, Suspense } from "react";

// const VacationsMainView = lazy(() => import("./views/VacationsMainView"));

// async function PageVacations({
//   searchParams,
// }: {
//   searchParams: Promise<{ [key: string]: string }>;
// }) {
//   const { view_type: viewType, id } = await searchParams;
//   return (
//     <Suspense fallback={<LoadingPage />}>
//       <VacationsMainView viewType={viewType} id={id} />
//     </Suspense>
//   );
// }

// export default PageVacations;

import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";

const VacationsMainView = lazy(() => import("./views/VacationsMainView"));

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
  const viewType = searchParams?.view_type ?? "list";
  const id = searchParams?.id ?? "null";

  // 👇 lo mandamos tal como strings (para no pelear con typings)
  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";

  return (
    <Suspense fallback={<LoadingPage />}>
      <VacationsMainView
        viewType={viewType}
        id={id}
        searchParams={{ page, limit }}
      />
    </Suspense>
  );
}
