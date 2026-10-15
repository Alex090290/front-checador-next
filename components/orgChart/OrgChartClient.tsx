"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, Container, Dropdown, InputGroup, Row } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";
import type { OrgChart, OrgChartNode } from "d3-org-chart";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import ErrorOverlay from "../ErrorOverlay";
import GenericSearchInput from "../employee/GenericSearchInput";
import { Department } from "@/lib/definitions";
import { IOrgNode, OrgNodeType } from "@/lib/orgChart/interface";

type FeedbackState = "loading" | "error" | null;

// Colores resueltos del tema actual (claro/oscuro). Se usan en línea para que también salgan al exportar la imagen
type ThemeColors = Record<
  "bg" | "text" | "muted" | "border" | "tertiary" |
  "primary" | "primaryBg" | "primaryText" | "primaryBorder" |
  "infoBg" | "infoText" | "infoBorder" |
  "successBg" | "successText" | "successBorder" |
  "warningBg" | "warningText" | "warningBorder" |
  "secondaryBg" | "secondaryText",
  string
>;

const CSS_VARS: Record<keyof ThemeColors, string> = {
  bg: "--bs-body-bg",
  text: "--bs-body-color",
  muted: "--bs-secondary-color",
  border: "--bs-border-color",
  tertiary: "--bs-tertiary-bg",
  primary: "--bs-primary",
  primaryBg: "--bs-primary-bg-subtle",
  primaryText: "--bs-primary-text-emphasis",
  primaryBorder: "--bs-primary-border-subtle",
  infoBg: "--bs-info-bg-subtle",
  infoText: "--bs-info-text-emphasis",
  infoBorder: "--bs-info-border-subtle",
  successBg: "--bs-success-bg-subtle",
  successText: "--bs-success-text-emphasis",
  successBorder: "--bs-success-border-subtle",
  warningBg: "--bs-warning-bg-subtle",
  warningText: "--bs-warning-text-emphasis",
  warningBorder: "--bs-warning-border-subtle",
  secondaryBg: "--bs-secondary-bg-subtle",
  secondaryText: "--bs-secondary-text-emphasis",
};

function readThemeColors(): ThemeColors {
  const style = getComputedStyle(document.body);
  const colors = {} as ThemeColors;
  (Object.keys(CSS_VARS) as (keyof ThemeColors)[]).forEach((key) => {
    colors[key] = style.getPropertyValue(CSS_VARS[key]).trim() || "#888888";
  });
  return colors;
}

// Los nombres y puestos vienen de la base: se escapan antes de meterlos al HTML
function escapeHtml(value?: string | number | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// Solo se usa la foto si es una URL utilizable; si no, se muestran las iniciales
function usablePicture(picture?: string | null) {
  return !!picture && /^(https?:|data:image\/)/i.test(picture);
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const TYPE_LABELS: Partial<Record<OrgNodeType, string>> = {
  director: "Dirección",
  gerente: "Gerente",
  subgerente: "Subgerente",
};

// Nodos visibles al iniciar: hasta los gerentes. En d3-org-chart, _expanded hace visible al nodo
// (y a sus ancestros); subgerentes y empleados quedan colapsados bajo su gerente.
const INITIAL_EXPANDED: OrgNodeType[] = ["empresa", "departamento", "director", "gerente"];

// Vista inicial: si todo el árbol cabe legible se ajusta completo; si no, se muestra la parte de arriba
// (empresa, dirección y el arranque de los departamentos) a un tamaño legible y el resto se recorre arrastrando
const MIN_READABLE_SCALE = 0.55;
const READABLE_SCALE = 0.8;

type PositionedNode = { x: number; y: number };
type ChartState = {
  root: PositionedNode & { descendants: () => PositionedNode[] };
  svgWidth: number;
  svgHeight: number;
  duration: number;
  layout: string;
  layoutBindings: Record<string, Record<"nodeLeftX" | "nodeRightX" | "nodeTopY" | "nodeBottomY", (d: PositionedNode) => number>>;
};

function showInitialView(chart: OrgChart<IOrgNode>) {
  const state = chart.getChartState() as ChartState;
  const bindings = state.layoutBindings[state.layout];
  const nodes = state.root.descendants();

  const minX = Math.min(...nodes.map((d) => d.x + bindings.nodeLeftX(d)));
  const maxX = Math.max(...nodes.map((d) => d.x + bindings.nodeRightX(d)));
  const minY = Math.min(...nodes.map((d) => d.y + bindings.nodeTopY(d)));
  const maxY = Math.max(...nodes.map((d) => d.y + bindings.nodeBottomY(d)));

  const w = state.svgWidth;
  const h = state.svgHeight;
  const fitScale = 0.9 / Math.max((maxX - minX + 100) / w, (maxY - minY + 100) / h);

  if (fitScale >= MIN_READABLE_SCALE) {
    chart.fit();
    return;
  }

  // Ventana del tamaño de la pantalla a escala legible, centrada en la raíz y pegada arriba
  const boundsWidth = (0.9 * w) / READABLE_SCALE;
  const boundsHeight = (0.9 * h) / READABLE_SCALE;
  const top = minY - 40;

  chart.zoomTreeBounds({
    x0: state.root.x - boundsWidth / 2,
    x1: state.root.x + boundsWidth / 2,
    y0: top,
    y1: top + boundsHeight,
    params: { animate: true, scale: true },
  });
}

function cardHtml(node: OrgChartNode<IOrgNode>, c: ThemeColors) {
  const d = node.data;
  const highlighted = d._highlighted || d._upToTheRootHighlighted;
  const highlight = highlighted ? `box-shadow:0 0 0 3px ${c.primary};` : "";

  // Departamento (y la empresa): tarjeta de acento
  if (d.type === "departamento" || d.type === "empresa") {
    const isCompany = d.type === "empresa";
    const bg = isCompany ? c.primaryBg : c.infoBg;
    const fg = isCompany ? c.primaryText : c.infoText;
    const bd = isCompany ? c.primaryBorder : c.infoBorder;
    const total = typeof d.total === "number"
      ? `<div style="font-size:12px;opacity:0.85;">${d.total} persona${d.total === 1 ? "" : "s"}</div>`
      : "";

    return `<div style="width:${node.width}px;height:${node.height}px;box-sizing:border-box;border-radius:12px;border:1px solid ${bd};background:${bg};color:${fg};display:flex;flex-direction:column;justify-content:center;padding:8px 14px;${highlight}">
      <div style="font-weight:700;font-size:14px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(d.name)}</div>
      ${total}
    </div>`;
  }

  // Personas: director, gerente, subgerente y empleado
  const accent: Record<string, [string, string, string]> = {
    director: [c.primaryBg, c.primaryText, c.primaryBorder],
    gerente: [c.successBg, c.successText, c.successBorder],
    subgerente: [c.warningBg, c.warningText, c.warningBorder],
    empleado: [c.secondaryBg, c.secondaryText, c.border],
  };
  const [accentBg, accentText, accentBorder] = accent[d.type] ?? accent.empleado;

  const avatar = usablePicture(d.picture)
    ? `<img src="${escapeHtml(d.picture)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid ${c.border};" />`
    : `<div style="width:44px;height:44px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;background:${accentBg};color:${accentText};border:1px solid ${accentBorder};">${escapeHtml(initials(d.name))}</div>`;

  const label = TYPE_LABELS[d.type];
  const badge = label
    ? `<span style="display:inline-block;margin-top:4px;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${accentBg};color:${accentText};border:1px solid ${accentBorder};">${label}</span>`
    : "";
  const extension = d.type === "empleado" && d.extensions?.length
    ? `<div style="font-size:11px;color:${c.muted};margin-top:2px;">Ext. ${escapeHtml(d.extensions.join(", "))}</div>`
    : "";

  return `<div style="width:${node.width}px;height:${node.height}px;box-sizing:border-box;border-radius:12px;border:1px solid ${c.border};border-left:4px solid ${accentText};background:${c.bg};color:${c.text};display:flex;align-items:center;gap:10px;padding:10px 12px;${highlight}">
    ${avatar}
    <div style="min-width:0;flex:1;">
      <div style="font-weight:700;font-size:13px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(d.name)}</div>
      <div style="font-size:12px;color:${c.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(d.position || "Sin puesto")}</div>
      ${badge}${extension}
    </div>
  </div>`;
}

export default function OrgChartClient({
  nodes,
  errorMessage,
  departments = [],
  idDepartment = "",
}: {
  nodes: IOrgNode[];
  errorMessage?: string;
  departments?: Department[];
  idDepartment?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<OrgChart<IOrgNode> | null>(null);
  const colorsRef = useRef<ThemeColors | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState(errorMessage ?? "");
  const [feedback, setFeedback] = useState<FeedbackState>(errorMessage ? "error" : null);
  const [rendering, setRendering] = useState(nodes.length > 0);
  const [noMatches, setNoMatches] = useState(false);

  // Al llegar datos nuevos se quita el loading; si el backend respondió error se muestra su message
  useEffect(() => {
    setFeedback(errorMessage ? "error" : null);
    setFeedbackMsg(errorMessage ?? "");
  }, [searchParamsString, errorMessage]);

  // Crea el organigrama (librería de DOM: solo en el navegador, cargada dentro del efecto)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || nodes.length === 0) return;

    let cancelled = false;
    setRendering(true);

    (async () => {
      try {
        const { OrgChart } = await import("d3-org-chart");
        if (cancelled) return;

        colorsRef.current = readThemeColors();
        container.innerHTML = "";

        // Copias: la librería agrega campos internos a cada nodo
        const data = nodes.map((n) => ({ ...n, _expanded: INITIAL_EXPANDED.includes(n.type) }));

        const chart = new OrgChart<IOrgNode>()
          .container(container)
          .svgHeight(container.clientHeight || 600)
          .data(data)
          .nodeId((d) => d.id)
          .parentNodeId((d) => d.parentId)
          .nodeWidth(() => 240)
          .nodeHeight((d) => (d.data.type === "departamento" ? 70 : 110))
          .childrenMargin(() => 50)
          .compactMarginBetween(() => 25)
          .imageName("Organigrama")
          .nodeContent((d) => cardHtml(d, colorsRef.current ?? readThemeColors()))
          .buttonContent(({ node }) => {
            const c = colorsRef.current ?? readThemeColors();
            const count = node.data._directSubordinatesPaging ?? node.data._directSubordinates ?? "";
            return `<div style="display:flex;align-items:center;justify-content:center;gap:3px;margin:auto;width:fit-content;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${c.bg};color:${c.muted};border:1px solid ${c.border};">${node.children ? "▲" : "▼"} ${count}</div>`;
          })
          .nodeUpdate(function () {
            // Sin el borde rosa por defecto: el resaltado va dentro de la tarjeta
            this.querySelector(".node-rect")?.setAttribute("stroke", "none");
          })
          .linkUpdate(function (d) {
            const c = colorsRef.current ?? readThemeColors();
            const highlighted = d.data._upToTheRootHighlighted;
            this.setAttribute("stroke", highlighted ? c.primary : c.border);
            this.setAttribute("stroke-width", highlighted ? "3" : "1.5");
          })
          .render();

        chartRef.current = chart;

        // Se espera a que termine la animación inicial para calcular la vista con las posiciones finales
        const { duration } = chart.getChartState() as ChartState;
        setTimeout(() => {
          if (!cancelled && chartRef.current === chart) showInitialView(chart);
        }, (duration || 400) + 50);
      } catch (error) {
        console.error(error);
        setFeedbackMsg("No se pudo mostrar el organigrama");
        setFeedback("error");
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
      chartRef.current = null;
      container.innerHTML = "";
    };
  }, [nodes]);

  // Si cambian a modo claro/oscuro, se repinta con los colores nuevos
  useEffect(() => {
    const observer = new MutationObserver(() => {
      colorsRef.current = readThemeColors();
      chartRef.current?.render();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
    return () => observer.disconnect();
  }, []);

  const handleDepartmentFilter = useCallback((value: string) => {
    if (value === idDepartment) return;

    setFeedback("loading");
    setFeedbackMsg("Cargando organigrama...");

    const params = new URLSearchParams(searchParamsString);
    if (value) {
      params.set("idDepartment", value);
    } else {
      params.delete("idDepartment");
    }
    const query = params.toString();
    router.push(`/app/orgChart${query ? `?${query}` : ""}`);
  }, [idDepartment, searchParamsString, router]);

  const handleSearch = useCallback((value: string) => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.clearHighlighting();
    setNoMatches(false);

    const term = normalize(value.trim());
    if (!term) {
      chart.render();
      return;
    }

    const matches = nodes.filter(
      (n) => n.type !== "departamento" && n.type !== "empresa" && normalize(n.name).includes(term)
    );

    if (!matches.length) {
      setNoMatches(true);
      chart.render();
      return;
    }

    matches.forEach((m) => chart.setHighlighted(m.id));
    chart.setCentered(matches[0].id).render();
  }, [nodes]);

  const handleExport = () => {
    const c = colorsRef.current ?? readThemeColors();
    chartRef.current?.exportImg({ full: true, backgroundColor: c.bg });
  };

  const selectedDepartmentName = useMemo(() => {
    if (!idDepartment) return "Todos";
    const found = departments.find((dep) => String(dep.id) === idDepartment);
    return found ? found.nameDepartment : "Todos";
  }, [idDepartment, departments]);

  const isEmpty = nodes.length === 0;
  const controlsDisabled = isEmpty || rendering;

  return (
    <>
      <ConditionalRender cond={feedback === "loading" || (rendering && !isEmpty)}>
        <Loading message={feedbackMsg || "Cargando organigrama..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <Container className="py-3" style={{ maxWidth: "1600px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">Organigrama</h1>
            <span className="text-muted">Estructura de la empresa por departamento</span>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col xs={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-3 p-md-4">
                <Row className="mb-3 g-3">

                  {/* FILTRO DE DEPARTAMENTOS */}
                  <Col xs={12} md={6} xl={3} style={{ minWidth: 0 }}>
                    <Card className="rounded-4 border h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-columns-gap text-primary" />
                          <span className="fw-semibold small">Departamento</span>
                        </div>

                        <Dropdown className="w-100">
                          <Dropdown.Toggle
                            id="orgchart-department-filter"
                            as={Button}
                            variant="outline-secondary"
                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                            style={{ minWidth: 0 }}
                          >
                            <span style={{ whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "left" }}>
                              {selectedDepartmentName}
                            </span>
                          </Dropdown.Toggle>

                          <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                            <Dropdown.Item active={!idDepartment} onClick={() => handleDepartmentFilter("")}>
                              <span className="text-uppercase text-muted">TODOS</span>
                            </Dropdown.Item>

                            {departments.map((dep) => (
                              <Dropdown.Item
                                key={dep.id}
                                active={String(dep.id) === idDepartment}
                                onClick={() => handleDepartmentFilter(String(dep.id))}
                              >
                                <span className="text-uppercase">{dep.nameDepartment}</span>
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* BUSCAR PERSONA */}
                  <Col xs={12} md={6} xl={4} style={{ minWidth: 0 }}>
                    <Card className="border rounded-4 h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-person text-primary" />
                          <span className="fw-semibold small">Buscar persona</span>
                        </div>

                        <InputGroup>
                          <InputGroup.Text className="bg-gray" style={{ color: "#6c757d" }}>
                            <i className="bi bi-search" />
                          </InputGroup.Text>
                          <GenericSearchInput
                            onSearch={handleSearch}
                            placeholder="Buscar por nombre..."
                          />
                        </InputGroup>

                        <ConditionalRender cond={noMatches}>
                          <small className="text-muted d-block mt-2">Sin coincidencias</small>
                        </ConditionalRender>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* ACCIONES */}
                  <Col xs={12} xl={5} style={{ minWidth: 0 }}>
                    <Card className="border rounded-4 h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-diagram-3 text-primary" />
                          <span className="fw-semibold small">Vista</span>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          <Button
                            variant="outline-primary"
                            className="d-inline-flex align-items-center gap-2 fw-semibold"
                            onClick={() => chartRef.current?.expandAll()}
                            disabled={controlsDisabled}
                          >
                            <i className="bi bi-arrows-expand" />
                            Expandir todo
                          </Button>

                          <Button
                            variant="outline-primary"
                            className="d-inline-flex align-items-center gap-2 fw-semibold"
                            onClick={() => chartRef.current?.collapseAll()}
                            disabled={controlsDisabled}
                          >
                            <i className="bi bi-arrows-collapse" />
                            Colapsar todo
                          </Button>

                          <Button
                            variant="outline-primary"
                            className="d-inline-flex align-items-center gap-2 fw-semibold"
                            onClick={() => chartRef.current?.fit()}
                            disabled={controlsDisabled}
                          >
                            <i className="bi bi-fullscreen" />
                            Ajustar a la pantalla
                          </Button>

                          <Button
                            variant="black"
                            className="text-light bg-black border-light d-inline-flex align-items-center gap-2 fw-semibold"
                            onClick={handleExport}
                            disabled={controlsDisabled}
                          >
                            <i className="bi bi-image" />
                            Exportar imagen
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* SIN DATOS */}
                <ConditionalRender cond={isEmpty}>
                  <div className="text-center py-5 text-muted border rounded-3">
                    <i
                      className={`bi ${idDepartment ? "bi-clipboard-x" : "bi-inbox"} d-block mb-2`}
                      style={{ fontSize: "2.5rem" }}
                    />
                    <span className="fw-semibold">
                      {idDepartment
                        ? "Este departamento no tiene personas en el organigrama"
                        : "No hay información para mostrar el organigrama"}
                    </span>
                  </div>
                </ConditionalRender>

                {/* ORGANIGRAMA: se mueve con el dedo o el mouse y se hace zoom */}
                <ConditionalRender cond={!isEmpty}>
                  <div
                    ref={containerRef}
                    className="border rounded-3 bg-body-tertiary overflow-hidden"
                    style={{ height: "70vh", minHeight: 420, touchAction: "none" }}
                  />
                </ConditionalRender>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
