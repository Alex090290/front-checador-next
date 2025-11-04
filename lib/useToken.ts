import { Session } from "next-auth";
import { auth } from "./auth";

interface IStoreToken {
  apiUrl: string | undefined;
  apiToken: string | null;
  user: Session["user"];
}

export async function storeToken(): Promise<IStoreToken> {
  const session = await auth();
  const apiToken = session?.user?.apiToken || "";
  const API_URL = process.env.API_URL;

  return {
    apiUrl: API_URL,
    apiToken,
    user: session?.user,
  };
}
