"use server";

import { auth } from "@/lib/auth";
import { Session } from "next-auth";

interface StoreSession {
  apiToken: string | undefined;
  session: Session["user"] | null;
  API_URL: string;
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
}

export async function storeAction(): Promise<StoreSession> {
  const session = await auth();
  const apiToken = session?.user?.apiToken;
  const API_URL = process.env.API_URL!;
  const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  return {
    session: session?.user,
    apiToken,
    API_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
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