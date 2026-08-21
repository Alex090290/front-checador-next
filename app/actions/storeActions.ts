"use server";

import { auth } from "@/lib/auth";
import { Session } from "next-auth";

interface StoreSession {
  apiToken: string | undefined;
  session: Session["user"] | null;
  API_URL: string;
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
  ENVIROMENT: string;
  ID_DEV_SISTEM_STAGING: string;
  ID_DEV_SISTEM_PRODUCTION: string;
}

export async function storeAction(): Promise<StoreSession> {
  const session = await auth();
  const apiToken = session?.user?.apiToken;
  const API_URL = process.env.API_URL!;
  const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  const ENVIROMENT = process.env.ENVIROMENT!;
  const ID_DEV_SISTEM_STAGING = process.env.ID_DEV_SISTEM_STAGING!;
  const ID_DEV_SISTEM_PRODUCTION = process.env.ID_DEV_SISTEM_PRODUCTION!;

  return {
    session: session?.user,
    apiToken,
    API_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    ENVIROMENT,
    ID_DEV_SISTEM_STAGING,
    ID_DEV_SISTEM_PRODUCTION
  };
}

// "use server";

// import { auth, signOut } from "@/lib/auth";
// import { Session } from "next-auth";

// interface StoreSession {
//   apiToken: string | undefined;
//   session: Session["user"] | null;
//   API_URL: string;
// }

// export async function storeAction(): Promise<StoreSession> {
//   const session = await auth();

//   if (!session?.user?.apiToken) {
//     await signOut({ redirectTo: "/auth" });
//     throw new Error("NO_SESSION");
//   }

//   const apiToken = session.user.apiToken;
//   const API_URL = process.env.API_URL!;

//   return {
//     session: session.user,
//     apiToken,
//     API_URL,
//   };
// }