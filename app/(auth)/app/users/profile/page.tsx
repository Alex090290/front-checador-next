import { findUserById } from "@/app/actions/user-actions";
import UserProfileView from "@/components/users/Profile";

export const dynamic = "force-dynamic";

type SearchParams = {
    id?: string;
  };

  
export default async function UserProfilePage({
    searchParams,
  }: {
    searchParams?: SearchParams;
  })  {
    const id = searchParams?.id ?? "null";

    const user = await findUserById({id: Number(id)});

  return <UserProfileView user={user} />;
}