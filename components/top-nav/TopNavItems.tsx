"use client";

import useSWR from "swr";
import { Accordion, Nav } from "react-bootstrap";
import { usePathname } from "next/navigation";
import NextLinkRef from "@/components/NextLinkRef";
import NavGroup from "@/components/NavGroup";

const MENU_STORAGE_KEY = "menu-data";

type MenuItem = {
  className: string;
  href?: string;
  span: string;
  eventKey?: string;
  children?: MenuItem[];
};

type TopNavItemsProps = {
  onNavigate?: () => void;
};

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

const fetcher = async (url: string) => {
  // 1. Busca en localStorage primero
  try {
    const cached = localStorage.getItem(MENU_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // 2. Si no hay caché, llama a /api/menu y guarda el resultado
  const res = await fetch(url);
  const data = await res.json();

  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(data));
  } catch {}

  return data;
};

function stableKey(item: MenuItem) {
  const base = item.eventKey ?? item.href ?? item.span;
  return base.split("?")[0];
}

function cleanHref(href?: string) {
  return href?.split("?")[0];
}

export default function TopNavItems({ onNavigate }: TopNavItemsProps) {
  const pathname = usePathname();

  const { data, error, isLoading } = useSWR("/api/menu", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  
  const items: MenuItem[] = data?.data ?? [];

  if (isLoading && items.length === 0) return null;
  if (error && items.length === 0) return null;

  let activeKey = "";

  items.forEach((item) => {
    const itemKey = stableKey(item);

    if (!item.children?.length) {
      if (pathname === cleanHref(item.href)) {
        activeKey = itemKey;
      }
    }

    item.children?.forEach((child) => {
      const childKey = stableKey(child);

      if (pathname === cleanHref(child.href)) {
        activeKey = childKey;
      }
    });
  });

  return (
    <Nav className="flex-column" variant="pills" activeKey={activeKey}>
      <Accordion alwaysOpen className="w-100 nav-accordion">
        {items.map((item) => {
          const key = stableKey(item);

          if (!item.children?.length) {
            return (
              <Nav.Item key={key}>
                <Nav.Link
                  as={NextLinkRef}
                  href={item.href!}
                  eventKey={key}
                  onClick={onNavigate}
                >
                  <i className={item.className}></i>
                  <span>{item.span}</span>
                </Nav.Link>
              </Nav.Item>
            );
          }

          return (
            <Nav.Item key={key}>
              <NavGroup
                eventKey={key}
                iconClass={item.className}
                label={item.span}
              />

              <Accordion.Collapse eventKey={key}>
                <div className="nav-submenu">
                  <Nav
                    className="flex-column ms-3"
                    variant="pills"
                    activeKey={activeKey}
                  >
                    {item.children.map((child) => {
                      const childKey = stableKey(child);

                      return (
                        <Nav.Item key={childKey}>
                          <Nav.Link
                            as={NextLinkRef}
                            href={child.href!}
                            eventKey={childKey}
                            onClick={onNavigate}
                          >
                            <i className={child.className}></i>
                            <span>{child.span}</span>
                          </Nav.Link>
                        </Nav.Item>
                      );
                    })}
                  </Nav>
                </div>
              </Accordion.Collapse>
            </Nav.Item>
          );
        })}
      </Accordion>
    </Nav>
  );
}