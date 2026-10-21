"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Form, InputGroup } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import { PermissionCatalogItem } from "@/lib/employeePermissions/interface";

const GROUP_ORDER = ["menu", "listar", "crear", "actualizar", "eliminar"];

const GROUP_LABELS: Record<string, string> = {
    menu: "Menú (menu_)",
    listar: "Listar (listar_)",
    crear: "Crear (crear_)",
    actualizar: "Actualizar (actualizar_)",
    eliminar: "Eliminar (eliminar_)",
    otros: "Otros",
};

const groupOf = (text: string) => {
    const prefix = text.split("_")[0];
    return GROUP_ORDER.includes(prefix) ? prefix : "otros";
};

//Catálogo de permisos agrupado por prefijo, con checkbox por permiso, "Todos" por grupo y buscador.
//Se usa en los permisos base y en los permisos de cada empleado (tagged = permisos con etiqueta "base")
export default function PermissionGroupsSelector({
    idPrefix,
    catalog,
    selected,
    onChange,
    readOnly = false,
    tagged,
}: {
    idPrefix: string;
    catalog: PermissionCatalogItem[];
    selected: Set<string>;
    onChange: (next: Set<string>) => void;
    readOnly?: boolean;
    tagged?: Set<string>;
}) {
    const [search, setSearch] = useState("");

    const groups = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = catalog
            .filter((p) => !term || p.text.toLowerCase().includes(term))
            .sort((a, b) => a.text.localeCompare(b.text));

        const map = new Map<string, string[]>();
        filtered.forEach((p) => {
            const g = groupOf(p.text);
            map.set(g, [...(map.get(g) ?? []), p.text]);
        });

        return [...GROUP_ORDER, "otros"]
            .filter((g) => map.has(g))
            .map((g) => ({ key: g, label: GROUP_LABELS[g], items: map.get(g) ?? [] }));
    }, [catalog, search]);

    const toggle = (text: string) => {
        const next = new Set(selected);
        if (next.has(text)) next.delete(text);
        else next.add(text);
        onChange(next);
    };

    const toggleGroup = (items: string[], check: boolean) => {
        const next = new Set(selected);
        items.forEach((t) => (check ? next.add(t) : next.delete(t)));
        onChange(next);
    };

    return (
        <>
            <InputGroup className="mb-3">
                <InputGroup.Text className="bg-gray" style={{ color: "#6c757d" }}>
                    <i className="bi bi-search" />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Buscar permiso..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>

            <ConditionalRender cond={groups.length === 0}>
                <div className="text-center text-muted py-4">Sin permisos que coincidan con la búsqueda</div>
            </ConditionalRender>

            {groups.map((group) => {
                const allChecked = group.items.every((t) => selected.has(t));
                const checkedCount = group.items.filter((t) => selected.has(t)).length;

                return (
                    <Card key={group.key} className="border rounded-4 mb-3">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                <span className="fw-semibold small">
                                    {group.label}
                                    <span className="text-muted fw-normal ms-2">{checkedCount}/{group.items.length}</span>
                                </span>
                                <Form.Check
                                    id={`${idPrefix}-group-${group.key}`}
                                    label="Todos"
                                    className="small"
                                    checked={allChecked}
                                    disabled={readOnly}
                                    onChange={() => toggleGroup(group.items, !allChecked)}
                                />
                            </div>

                            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-1">
                                {group.items.map((text) => (
                                    <div key={text} className="col">
                                        <Form.Check
                                            id={`${idPrefix}-${text}`}
                                            label={
                                                <span className="small text-break">
                                                    {text}
                                                    {tagged?.has(text) && (
                                                        <Badge bg="info-subtle" text="info-emphasis" className="ms-2 border border-info-subtle fw-semibold">
                                                            base
                                                        </Badge>
                                                    )}
                                                </span>
                                            }
                                            checked={selected.has(text)}
                                            disabled={readOnly}
                                            onChange={() => toggle(text)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                );
            })}
        </>
    );
}
