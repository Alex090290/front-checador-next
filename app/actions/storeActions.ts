"use server";

import { auth } from "@/lib/auth";
import { Session } from "next-auth";

interface StoreSession {
  apiToken: string | undefined;
  session: Session["user"] | null;
  API_URL: string;
}

export async function storeAction(): Promise<StoreSession> {
  const session = await auth();
  const apiToken = session?.user?.apiToken;
  const API_URL = process.env.API_URL!;

  return {
    session: session?.user,
    apiToken,
    API_URL,
  };
}
