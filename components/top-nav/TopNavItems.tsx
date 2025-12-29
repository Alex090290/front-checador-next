"use client";

import useSWR from "swr";
import { Accordion, Nav } from "react-bootstrap";
import NextLinkRef from "@/components/NextLinkRef";
import NavGroup from "@/components/NavGroup";

type MenuItem = {
  className: string;
  href?: string;
  span: string;
  eventKey?: string;
  children?: MenuItem[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function stableKey(item: MenuItem) {
  const base = item.eventKey ?? item.href ?? item.span;
  return base.split("?")[0];
}

export default function TopNavItems() {
  const { data, error, isLoading } = useSWR("/api/menu", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  const items: MenuItem[] = data?.data ?? [];

  if (isLoading && items.length === 0) return null;
  if (error && items.length === 0) return null;

  return (
    <Nav className="flex-column" defaultActiveKey="/app" variant="pills">
      <Accordion alwaysOpen className="w-100 nav-accordion">
        {items.map((item) => {
          const key = stableKey(item);

          // Item normal
          if (!item.children?.length) {
            return (
              <Nav.Item key={key}>
                <Nav.Link as={NextLinkRef} href={item.href!} eventKey={key}>
                  <i className={item.className}></i>
                  <span>{item.span}</span>
                </Nav.Link>
              </Nav.Item>
            );
          }

          // Grupo (Incidencias)
          return (
            <Nav.Item key={key}>
              <NavGroup eventKey={key} iconClass={item.className} label={item.span} />

              <Accordion.Collapse eventKey={key}>
                <div className="nav-submenu">
                  <Nav className="flex-column" variant="pills">
                    {item.children.map((child) => {
                      const childKey = stableKey(child);
                      return (
                        <Nav.Item key={childKey}>
                          <Nav.Link as={NextLinkRef} href={child.href!} eventKey={childKey}>
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
