"use client";

import { Accordion, Nav } from "react-bootstrap";
import { usePathname } from "next/navigation";
import NextLinkRef from "@/components/NextLinkRef";
import NavGroup from "@/components/NavGroup";
import { MenuItem, useMenu } from "./useMenu";

type TopNavItemsProps = {
  onNavigate?: () => void;
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

  // El menú ya viene precargado desde el Sidebar (useMenuRefresh); aquí solo se lee
  const { data, error, isLoading } = useMenu();

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
        {items.map((item, index) => {
          const key = stableKey(item);

          if (!item.children?.length) {
            return (
              <Nav.Item key={index}>
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