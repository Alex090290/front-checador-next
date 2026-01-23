"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { Table, Form, Button } from "react-bootstrap";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export type TableTemplateColumn<T> = {
  key: string;
  label: string;
  type?: "string" | "number" | "date" | "boolean";
  filterable?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessor: (row: T) => any;
  render?: (row: T) => React.ReactNode;
  groupFormat?: string;
};

export type TableTemplateRef = {
  clearSelection: () => void;
};

type TableServerProps<T> = {
  columns: TableTemplateColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  onSelectionChange?: (ids: Array<string | number>) => void;

  // ✅ navegación opcional
  viewForm?: string;

  // ✅ paginación server-side (controlada)
  page: number; // 1-based
  limit: number;
  total: number;
  onPageChange: (nextPage: number) => void;

  // opcional: desactivar click fila
  disableRowClick?: boolean;
};

function buildRowHref(viewForm: string, id: string | number) {
  // si ya trae ?, agregamos &; si no, agregamos ?
  const sep = viewForm.includes("?") ? "&" : "?";
  return `${viewForm}${sep}id=${encodeURIComponent(String(id))}`;
}

function TableTemplateServerInner<T>(
  {
    columns,
    data,
    getRowId,
    onSelectionChange,
    viewForm,
    page,
    limit,
    total,
    onPageChange,
    disableRowClick = false,
  }: TableServerProps<T>,
  ref: React.Ref<TableTemplateRef>
) {
  const router = useRouter();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    {}
  );

  // 🔹 Exponer función para limpiar selección
  useImperativeHandle(ref, () => ({
    clearSelection: () => setSelectedIds([]),
  }));

  // Notificar cambios de selección
  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  // ✅ si cambia la data (por paginación/filtros server), limpia selección visible si quieres:
  // (no la borro completa para no sorprender, pero sí asegura que no "select all" se rompa)
  const dataIdsSetRef = useRef<Set<string | number>>(new Set());
  useEffect(() => {
    dataIdsSetRef.current = new Set(data.map(getRowId));
    // opcional: remover ids que ya no existen en la página actual
    setSelectedIds((prev) => prev.filter((id) => dataIdsSetRef.current.has(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // 👇 no cambiamos page aquí porque esto es filtro local a la página actual
  };

  const handleHeaderDoubleClick = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyDateFilter = (rawValue: any, filterValue: string) => {
    if (!rawValue) return false;
    const rawDate = new Date(rawValue);
    if (isNaN(rawDate.getTime())) return false;

    const f = filterValue.trim();
    if (f.includes("..")) {
      const [start, end] = f.split("..").map((d) => d.trim());
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;
      if (startDate && rawDate < startDate) return false;
      if (endDate && rawDate > endDate) return false;
      return true;
    }
    if (f.startsWith(">=")) return rawDate >= new Date(f.slice(2));
    if (f.startsWith("<=")) return rawDate <= new Date(f.slice(2));
    if (f.startsWith(">")) return rawDate > new Date(f.slice(1));
    if (f.startsWith("<")) return rawDate < new Date(f.slice(1));

    return rawDate.toISOString().slice(0, 10) === f;
  };

  // ✅ Filtros/sort aplican SOLO sobre la data recibida (página actual)
  const processedData = useMemo(() => {
    let filtered = data.filter((row) =>
      columns.every((col) => {
        if (!col.filterable) return true;
        const filterValue = filters[col.key]?.trim() ?? "";
        if (!filterValue) return true;

        const rawValue = col.accessor(row);

        if (col.type === "date") return applyDateFilter(rawValue, filterValue);
        if (rawValue == null) return false;

        const filterValues = filterValue
          .split(",")
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0);

        return filterValues.some((fv) =>
          String(rawValue).toLowerCase().includes(fv)
        );
      })
    );

    if (sortConfig.key) {
      const col = columns.find((c) => c.key === sortConfig.key);
      if (col) {
        filtered = [...filtered].sort((a, b) => {
          let aValue = col.accessor(a);
          let bValue = col.accessor(b);

          switch (col.type) {
            case "number":
              aValue = Number(aValue);
              bValue = Number(bValue);
              break;
            case "date":
              aValue = aValue ? new Date(aValue).getTime() : 0;
              bValue = bValue ? new Date(bValue).getTime() : 0;
              break;
            default:
              aValue = String(aValue ?? "").toLowerCase();
              bValue = String(bValue ?? "").toLowerCase();
          }

          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    return filtered;
  }, [data, filters, sortConfig, columns]);

  const toggleGroupBy = (key: string) => {
    if (groupBy === key) {
      setGroupBy(null);
      setCollapsedGroups({});
      return;
    }

    setGroupBy(key);

    const col = columns.find((c) => c.key === key);
    if (!col) return;

    const groups = processedData.reduce<Record<string, boolean>>((acc, row) => {
      let val = col.accessor(row);
      if (col.type === "date" && val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) val = format(d, col.groupFormat || "yyyy-MM");
      }
      acc[val ?? "Sin valor"] = true; // collapsed por default
      return acc;
    }, {});

    setCollapsedGroups(groups);
  };

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const groupedData = useMemo(() => {
    if (!groupBy) return { null: processedData };

    const col = columns.find((c) => c.key === groupBy);
    if (!col) return { null: processedData };

    return processedData.reduce<Record<string, T[]>>((groups, row) => {
      let val = col.accessor(row);
      if (col.type === "date" && val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) val = format(d, col.groupFormat || "yyyy-MM");
      }
      const k = val ?? "Sin valor";
      if (!groups[k]) groups[k] = [];
      groups[k].push(row);
      return groups;
    }, {});
  }, [processedData, groupBy, columns]);

  const visibleData = useMemo(() => {
    // en server-side NO cortamos nada por page aquí
    return groupedData;
  }, [groupedData]);

  const handleRowSelect = (id: string | number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const allVisibleIds = Object.entries(visibleData)
    .filter(([group]) => !(collapsedGroups[group] ?? false))
    .flatMap(([_, rows]) => rows.map(getRowId));

  const handleSelectAll = (checked: boolean) => {
    const visibleIds = allVisibleIds;

    if (checked) {
      const hiddenIds = selectedIds.filter((id) => !visibleIds.includes(id));
      setSelectedIds([...hiddenIds, ...visibleIds]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  // ✅ footer info
  const pages = Math.max(Math.ceil(total / limit), 1);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Table borderless hover style={{ fontSize: "0.9rem" }}>
      <thead className="sticky-top text-uppercase" style={{ zIndex: 1 }}>
        <tr>
          <th className="text-center border-end border-bottom table-active">
            <Form.Check
              type="checkbox"
              checked={
                allVisibleIds.length > 0 &&
                allVisibleIds.every((id) => selectedIds.includes(id))
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </th>

          {columns.map((col) => (
            <th
              key={col.key}
              style={{ minWidth: 120 }}
              onDoubleClick={() => handleHeaderDoubleClick(col.key)}
              className="border-end border-bottom table-active text-nowrap"
            >
              <div className="d-flex align-items-center gap-1">
                {col.filterable ? (
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder={col.label}
                    value={filters[col.key] ?? ""}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                    className="fw-bolder"
                  />
                ) : (
                  col.label
                )}

                <i
                  className={`bi bi-collection ${
                    groupBy === col.key ? "text-warning" : "text-muted"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleGroupBy(col.key)}
                  title={`Agrupar por ${col.label}`}
                />

                {sortConfig.key === col.key &&
                  (sortConfig.direction === "asc" ? (
                    <i className="bi bi-arrow-bar-up"></i>
                  ) : (
                    <i className="bi bi-arrow-bar-down"></i>
                  ))}
              </div>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {Object.entries(visibleData).map(([group, rows]) => {
          const isCollapsed = collapsedGroups[group] ?? false;

          return (
            <React.Fragment key={group}>
              {groupBy && (
                <tr
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleGroupCollapse(group)}
                  className="border-bottom"
                >
                  <td colSpan={columns.length + 1}>
                    {columns.find((c) => c.key === groupBy)?.label}: {group} (
                    {rows.length}){" "}
                    <i
                      className={`bi ${
                        isCollapsed ? "bi-caret-down-fill" : "bi-caret-up-fill"
                      }`}
                    />
                  </td>
                </tr>
              )}

              {!isCollapsed &&
                rows.map((row) => {
                  const id = getRowId(row);

                  return (
                    <tr
                      key={id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (disableRowClick) return;
                        if (!viewForm) return;
                        router.push(buildRowHref(viewForm, id));
                      }}
                      style={{ cursor: viewForm && !disableRowClick ? "pointer" : "default" }}
                    >
                      <td className="text-center border-bottom" valign="middle">
                        <Form.Check
                          type="checkbox"
                          checked={selectedIds.includes(id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleRowSelect(id, e.target.checked)}
                        />
                      </td>

                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="border-bottom text-truncate"
                          valign="middle"
                        >
                          {col.render ? col.render(row) : String(col.accessor(row) ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </React.Fragment>
          );
        })}
      </tbody>

      <tfoot className="sticky-bottom">
        <tr style={{ display: total > 0 ? "table-row" : "none" }}>
          <td colSpan={columns.length + 1}>
            <div className="d-flex justify-content-end align-items-center gap-2">
              <span className="text-muted small">
                Mostrando {from}-{to} de {total} — Página {page} de {pages}
              </span>

              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={page <= 1}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                  <i className="bi bi-rewind-fill" />
                </Button>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={page >= pages}
                  onClick={() => onPageChange(Math.min(pages, page + 1))}
                >
                  <i className="bi bi-fast-forward-fill" />
                </Button>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </Table>
  );
}

const TableTemplateServer = forwardRef(TableTemplateServerInner) as <T>(
  props: TableServerProps<T> & { ref?: React.Ref<TableTemplateRef> }
) => ReturnType<typeof TableTemplateServerInner>;

export default TableTemplateServer;
