"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Dropdown, Stack } from "react-bootstrap";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { loadAvatar } from "@/app/actions/user-actions";
import { useSearchParams } from "next/navigation";
import { getCurrentPeriod } from "@/app/actions/periods-actions";
import { ICurrentPeriod } from "@/lib/definitions";
import moment from "moment-timezone";

function NavUserInfo() {
  const { data: session } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<ICurrentPeriod | null> (null)
  const [imgAvatar, setImgAvatar] = useState<string | null>(null);

  const params = useSearchParams();
  const profile = params.get("profile") || null;

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute(
      "data-bs-theme",
      newMode ? "dark" : "light"
    );
    localStorage.setItem("darkModeSelection", newMode ? "dark" : "light");
  };

  useEffect(() => {
    const darkModeSelection = localStorage.getItem("darkModeSelection");
    if (darkModeSelection === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      setDarkMode(false);
      document.documentElement.setAttribute("data-bs-theme", "light");
    }
  }, []);
  useEffect(() => {
    modalDelete()
  }, []);

  useEffect(() => {
    if (session && session.user) {
      const loadImgAvatar = async () => {
        const res = await loadAvatar();
        if (!res.success) setImgAvatar(null);
        setImgAvatar(res.data || null);
      };
      loadImgAvatar();
    }
  }, [session, profile]);

  const modalDelete = async () => {
    await getCurrentPeriod().then((value: ICurrentPeriod | null)=>{
        setCurrentPeriod(value)
    })
  }  
   
 return (
  <Stack direction="horizontal" gap={2} className="align-items-center">
    <Dropdown>
      <Dropdown.Toggle
        variant={darkMode ? "dark" : "light"}
        className="border-0 d-flex align-items-center"
      >
        <Image
          width={26}
          height={26}
          unoptimized
          src={imgAvatar ?? "/image/avatar_default.svg"}
          alt=""
          className="me-2 rounded"
        />
        <span className="text-uppercase">{session?.user?.name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          as={Link}
          href={`/app/users?view_type=form&id=${session?.user?.id}&profile=true`}
        >
          <i className="bi bi-person-circle me-2"></i>
          <span>Perfil</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => signOut()}>
          <i className="bi bi-box-arrow-right me-2"></i>
          <span>Cerrar sesión</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <div className="vr" />

    <Button
      className="border-0"
      variant={darkMode ? "dark" : "light"}
      onClick={toggleDarkMode}
    >
      {darkMode ? (
        <i className="bi bi-sun-fill"></i>
      ) : (
        <i className="bi bi-moon-stars-fill"></i>
      )}
    </Button>

{/* ✅ Periodo/Año/Fechas compactos */}
<div className="d-none d-md-flex align-items-center gap-2 ms-1">
  <span className="text-muted small text-uppercase">Periodo:</span>
  <span className="fw-semibold small text-uppercase">
    {currentPeriod?.description ?? "—"}
  </span>

  <span className="text-muted small">·</span>

  {/* <span className="text-muted small text-uppercase">Año:</span>
  <span className="fw-semibold small">{currentPeriod?.year ?? "—"}</span>

  <span className="text-muted small">·</span> */}

  <span className="text-muted small text-uppercase">Inicio:</span>
  <span className="fw-semibold small">
    {currentPeriod?.dateInit
      ? moment.utc(currentPeriod.dateInit).format("DD/MM/YYYY")
      : "—"}
  </span>

  <span className="text-muted small">·</span>

  <span className="text-muted small text-uppercase">Fin:</span>
  <span className="fw-semibold small">
    {currentPeriod?.dateEnd
      ? moment.utc(currentPeriod.dateEnd).format("DD/MM/YYYY")
      : "—"}
  </span>
</div>

{/* ✅ En móvil: un solo renglón compactado */}
<div className="d-flex d-md-none align-items-center ms-1">
  <span className="badge bg-secondary text-uppercase">
    {currentPeriod?.description ?? "—"} · {currentPeriod?.year ?? "—"}
    {" · "}
    {currentPeriod?.dateInit
      ? moment.utc(currentPeriod.dateInit).format("DD/MM/YYYY")
      : "—"}
    {" - "}
    {currentPeriod?.dateEnd
      ? moment.utc(currentPeriod.dateEnd).format("DD/MM/YYYY")
      : "—"}
  </span>
</div>

  </Stack>
);

}

export default NavUserInfo;
