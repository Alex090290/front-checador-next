"use client";

import { getWelcome } from "@/app/actions/entry-actions";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function HealthCheck() {
  const pathname = usePathname();
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    const DEV_FORCE_JWT = false;

    const fetchHealth = async () => {
      const res = DEV_FORCE_JWT
        ? { success: false, message: "jwt" }
        : await getWelcome();

      if (!res.success) {
        if (res.message === "jwt") {
          setResponse("La sesión expiró");

          // signOut();

          return;
        }

        setResponse(res.message);
      }
    };

    fetchHealth();
  }, [pathname]);

  if (!response) return null; 

    return (
      <div
        className="position-fixed top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-center"
        style={{
          background: "rgba(0,0,0,.75)",
          zIndex: 9999,
        }}
      >
        <div
          className="bg-white rounded-4 shadow p-5 text-center"
          style={{ maxWidth: "550px", width: "90%" }}
        >
          <div className="display-1 mb-3">⚠️</div>

          <h2 className="fw-bold text-danger mb-3">
            Sesión expirada
          </h2>

          <p className="text-secondary fs-5">
            Tu sesión ha finalizado porque el token ya no es válido.
            Para continuar vuelve a iniciar sesión.
          </p>

          <div className="d-grid gap-3 mt-4">

            <button
              className="btn btn-outline-danger"
              onClick={() => signOut()}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
}

export default HealthCheck;
