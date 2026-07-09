"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Card, Collapse, Dropdown, Stack } from "react-bootstrap";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { loadAvatar } from "@/app/actions/user-actions";
import { useSearchParams } from "next/navigation";
import { getCurrentPeriod } from "@/app/actions/periods-actions";
import { ICurrentPeriod } from "@/lib/definitions";
import moment from "moment-timezone";
import ConditionalRender from "../ConditionalRender";

function NavUserInfo() {
  const { data: session } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<ICurrentPeriod | null>(null)
  const [imgAvatar, setImgAvatar] = useState<string | null>(null);
  const params = useSearchParams();
  const profile = params.get("profile") || null;
  const [showPeriodInfo, setShowPeriodInfo] = useState(false);


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
    await getCurrentPeriod().then((value: ICurrentPeriod | null) => {
      setCurrentPeriod(value)
    })
  }

  const singOutHanddle = ()=>{
    localStorage.removeItem("menu-data");
    signOut()
  }
  const [profileOpen, setProfileOpen] = useState(false);

  const periodText = `${currentPeriod?.description ?? "—"} · ${currentPeriod?.dateInit
    ? moment.utc(currentPeriod.dateInit).format("DD/MM/YYYY")
    : "—"
    } - ${currentPeriod?.dateEnd
      ? moment.utc(currentPeriod.dateEnd).format("DD/MM/YYYY")
      : "—"
    }`;

  return (
    <> <style>{` #nav-user-dropdown-toggle::after { display: none; }`}</style>

      <Stack
        direction="horizontal"
        gap={2}
        className="align-items-center flex-wrap flex-md-nowrap"
        style={{ maxWidth: "100%", minWidth: 0 }}
      >
        <Dropdown
          show={profileOpen}
          onToggle={(isOpen) => setProfileOpen(isOpen)}
          className="position-relative flex-shrink-0"
        >
          <Dropdown.Toggle
            id="nav-user-dropdown-toggle"
            variant={darkMode ? "dark" : "light"}
            className="border-0 d-flex align-items-center overflow-hidden"
            style={{ maxWidth: "140px", minWidth: 0 }}
          >
            <Image
              width={26}
              height={26}
              unoptimized
              src={imgAvatar ?? "/image/avatar_default.svg"}
              alt=""
              className="me-2 rounded flex-shrink-0"
            />

            <span className="text-uppercase text-truncate d-inline-block" style={{ maxWidth: "85px" }} > {session?.user?.name} </span>

            <i
              className={`bi ms-1 ${profileOpen ? "bi-chevron-up" : "bi-chevron-down"
                }`}
            />
          </Dropdown.Toggle>

          <Dropdown.Menu
            align="end"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              left: "auto",
              zIndex: 2000,
            }}
          >
            
            <Dropdown.Item
              as={Link}
              href={`/app/users/profile?id=${session?.user?.id}`}
            >
              <i className="bi bi-person-circle me-2"></i>
              <span>Perfil</span>
            </Dropdown.Item>
            

            <Dropdown.Item onClick={() =>singOutHanddle()}>
              <i className="bi bi-box-arrow-right me-2"></i>
              <span>Cerrar sesión</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <div className="vr flex-shrink-0 mx-1" />

        <Button
          className="border-0 flex-shrink-0"
          variant={darkMode ? "dark" : "light"}
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <i className="bi bi-sun-fill"></i>
          ) : (
            <i className="bi bi-moon-stars-fill"></i>
          )}
        </Button>

        {/* Desktop / tablet */}
        <div
          className="d-none d-md-flex align-items-center gap-2 ms-1 overflow-hidden"
          style={{ minWidth: 0 }}
          title={periodText}
        >
          <span className="text-muted small text-uppercase flex-shrink-0">
            Periodo:
          </span>

          <span className="fw-semibold small text-uppercase text-truncate">
            {currentPeriod?.description ?? "—"}
          </span>

          <span className="text-muted small flex-shrink-0">·</span>

          <span className="text-muted small text-uppercase flex-shrink-0">
            Inicio:
          </span>

          <span className="fw-semibold small flex-shrink-0">
            {currentPeriod?.dateInit
              ? moment.utc(currentPeriod.dateInit).format("DD/MM/YYYY")
              : "—"}
          </span>

          <span className="text-muted small flex-shrink-0">·</span>

          <span className="text-muted small text-uppercase flex-shrink-0">
            Fin:
          </span>

          <span className="fw-semibold small flex-shrink-0">
            {currentPeriod?.dateEnd
              ? moment.utc(currentPeriod.dateEnd).format("DD/MM/YYYY")
              : "—"}
          </span>
        </div>

        {/* Mobile */}
        <div className="d-md-none position-relative flex-shrink-0">
          <span
            role="button"
            className="badge bg-secondary text-uppercase text-truncate"
            style={{
              maxWidth: "80px",
              cursor: "pointer",
            }}
            onClick={() => setShowPeriodInfo(!showPeriodInfo)}
          >
            {/* {currentPeriod?.description ?? "—"} */}

            <i
              className={`bi ms-1 ${showPeriodInfo ? "bi-chevron-up" : "bi-chevron-down"
                }`}
            />
          </span>

          <Collapse in={showPeriodInfo}>
            <div>
              <Card
                className="position-absolute mt-2 shadow-sm"
                style={{
                  right: 0,
                  width: "min(250px, calc(100vw - 24px))",
                  zIndex: 2000,
                }}
              >
                <Card.Body className="p-2 small">
                  <div>
                    <strong>Periodo:</strong>{" "}
                    {currentPeriod?.description ?? "—"}
                  </div>

                  <div>
                    <strong>Inicio:</strong>{" "}
                    {currentPeriod?.dateInit
                      ? moment.utc(currentPeriod.dateInit).format("DD/MM/YYYY")
                      : "—"}
                  </div>

                  <div>
                    <strong>Fin:</strong>{" "}
                    {currentPeriod?.dateEnd
                      ? moment.utc(currentPeriod.dateEnd).format("DD/MM/YYYY")
                      : "—"}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Collapse>
        </div>
      </Stack>
    </>
  );
}

export default NavUserInfo;
