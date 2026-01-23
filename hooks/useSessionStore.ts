import { useRef } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export function useSessionSnapshot() {
  const { data: session } = useSession();
  const snapshot = useRef<{
    uid: Session["user"] | undefined;
  } | null>(null);

  if (!snapshot.current && session) {
    snapshot.current = {
      uid: session.user || undefined,
    };
  }

  return snapshot.current;
}
