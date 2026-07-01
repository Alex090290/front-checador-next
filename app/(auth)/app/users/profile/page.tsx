import { findUserById } from "@/app/actions/user-actions";
import Loading from "@/components/LoadingSpinner";
import UserProfileView from "@/components/users/Profile";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type SearchParams = {
  id?: string;
};


export default async function UserProfilePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const id = searchParams?.id ?? "null";

  const user = await findUserById({ id: Number(id) });

  return (
    <>
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <UserProfileView user={user} />;
      </Suspense>
    </>
  )
}