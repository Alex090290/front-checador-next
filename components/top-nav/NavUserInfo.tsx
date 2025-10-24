"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Dropdown, Stack } from "react-bootstrap";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { loadAvatar } from "@/app/actions/user-actions";
import { useSearchParams } from "next/navigation";

function NavUserInfo() {
  const { data: session } = useSession();
  const [darkMode, setDarkMode] = useState(false);
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

  // ✅ Este efecto solo corre al montar
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
    if (session && session.user) {
      const loadImgAvatar = async () => {
        const res = await loadAvatar();
        if (!res.success) setImgAvatar(null);
        setImgAvatar(res.data || null);
      };
      loadImgAvatar();
    }
  }, [session, profile]);

  return (
    <Stack direction="horizontal" gap={2}>
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
          <Dropdown.Item as={Button} onClick={() => signOut()}>
            <i className="bi bi-box-arrow-right me-2"></i>
            <span>Cerrar sesión</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <div className="vr" />
      {/* <Button variant="light" type="button" className="text-uppercase border-0">
        <Clock />
      </Button> */}
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
    </Stack>
  );
}

export default NavUserInfo;
