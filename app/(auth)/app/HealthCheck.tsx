"use client";

import { getWelcome } from "@/app/actions/entry-actions";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";

function HealthCheck() {
  const pathname = usePathname();
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      const res = await getWelcome();
      if (!res.success) {
        if (res.message === "jwt") {
          setResponse("la Sesión expiró");
          signOut();
          return;
        }
        setResponse(res.message);
      }
    };

    fetchHealth();
  }, [pathname]);

  if (response) {
    return (
      <Alert variant="danger" className="m-0 p-1 text-center fs-4">
        <i className="bi bi-exclamation-triangle-fill me-3"></i>
        <span className="text-uppercase">{response}</span>
      </Alert>
    );
  } else {
    return null;
  }
}

export default HealthCheck;
