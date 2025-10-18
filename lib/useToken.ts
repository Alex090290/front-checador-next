import { auth } from "./auth";

interface IStoreToken {
  apiUrl: string | undefined;
  apiToken: string | null;
}

export async function storeToken(): Promise<IStoreToken> {
  const session = await auth();
  const apiToken = session?.user?.apiToken || "";
  const API_URL = process.env.API_URL;

  return {
    apiUrl: API_URL,
    apiToken,
  };
}
