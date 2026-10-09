"use client";

import { IEmployeeDirectory } from "@/lib/employeeDirectory/interface";
import { Branch, Department } from "@/lib/definitions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Dropdown, InputGroup, Pagination, Row } from "react-bootstrap";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import ErrorOverlay from "../ErrorOverlay";
import GenericSearchInput from "../employee/GenericSearchInput";

type FeedbackState = "loading" | "success" | "error" | null;

const wrapStyle: React.CSSProperties = {
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  minWidth: 0,
};

function DirectoryCard({ employee }: { employee: IEmployeeDirectory }) {
  const extensions = employee.extensions ?? [];
  const phones = employee.phonesCompany ?? [];
  const emails = employee.emailsCompany ?? [];
  const hasContact = extensions.length > 0 || phones.length > 0 || emails.length > 0;

  const subtitle = [employee.position?.namePosition, employee.department?.nameDepartment]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="border rounded-4 h-100">
      <Card.Body className="p-3 p-md-4 d-flex flex-column">
        <div className="d-flex align-items-center gap-3 mb-3" style={{ minWidth: 0 }}>
          {/* Siempre la imagen por defecto (picture no se usa por ahora) */}
          <Image
            src="/image/avatar_default.svg"
            alt={employee.fullName}
            width={56}
            height={56}
            unoptimized
            className="rounded-circle border flex-shrink-0"
            style={{ objectFit: "cover" }}
          />

          <div style={{ minWidth: 0 }}>
            <div className="fw-bold text-uppercase lh-sm" style={wrapStyle}>
              {employee.fullName}
            </div>
            <ConditionalRender cond={!!subtitle}>
              <div className="text-muted small text-uppercase" style={wrapStyle}>
                {subtitle}
              </div>
            </ConditionalRender>
          </div>
        </div>

        <div className="d-flex flex-column gap-2 border-top pt-3 small flex-grow-1">
          <ConditionalRender cond={extensions.length > 0}>
            <div className="d-flex align-items-start gap-2">
              <i className="bi bi-telephone text-primary mt-1" />
              <div className="d-flex flex-wrap column-gap-3 row-gap-1" style={{ minWidth: 0 }}>
                {extensions.map((ext, i) => (
                  <span key={`${ext}-${i}`} className="fw-semibold text-nowrap">Ext. {ext}</span>
                ))}
              </div>
            </div>
          </ConditionalRender>

          <ConditionalRender cond={phones.length > 0}>
            <div className="d-flex align-items-start gap-2">
              <i className="bi bi-phone text-success mt-1" />
              <div className="d-flex flex-column row-gap-1" style={{ minWidth: 0 }}>
                {phones.map((phone, i) => (
                  <a
                    key={`${phone.e164Number}-${i}`}
                    href={`tel:${phone.e164Number}`}
                    className="fw-semibold text-decoration-none text-nowrap"
                  >
                    {phone.internationalNumber}
                  </a>
                ))}
              </div>
            </div>
          </ConditionalRender>

          <ConditionalRender cond={emails.length > 0}>
            <div className="d-flex align-items-start gap-2">
              <i className="bi bi-envelope text-info mt-1" />
              <div className="d-flex flex-column row-gap-1" style={{ minWidth: 0 }}>
                {emails.map((email, i) => (
                  <a
                    key={`${email}-${i}`}
                    href={`mailto:${email}`}
                    className="fw-semibold text-decoration-none"
                    style={wrapStyle}
                  >
                    {email}
                  </a>
                ))}
              </div>
            </div>
          </ConditionalRender>

          <ConditionalRender cond={!hasContact}>
            <div className="text-muted fst-italic">Sin datos de contacto</div>
          </ConditionalRender>
        </div>

        <ConditionalRender cond={!!employee.branch?.name}>
          <div className="mt-3">
            <span className="badge rounded-pill px-2 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle text-uppercase text-wrap text-start">
              <i className="bi bi-building me-1" />
              {employee.branch?.name}
            </span>
          </div>
        </ConditionalRender>
      </Card.Body>
    </Card>
  );
}

export default function EmployeeDirectoryClient({
  employees,
  total,
  page,
  limit,
  errorMessage,
  search,
  departments = [],
  branches = [],
}: {
  employees: IEmployeeDirectory[];
  total: number;
  page: number;
  limit: number;
  errorMessage?: string;
  search?: string;
  departments?: Department[];
  branches?: Branch[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();
  const currentSearch = sp.get("search") ?? "";
  const currentBranch = sp.get("branch") ?? "";
  const currentIdDepartment = sp.get("idDepartment") ?? "";

  const [feedbackMsg, setFeedbackMsg] = useState(errorMessage ?? "");
  const [feedback, setFeedback] = useState<FeedbackState>(errorMessage ? "error" : null);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const MAX_VISIBLE = 5;

  const visiblePages = useMemo(() => {
    if (totalPages <= MAX_VISIBLE) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, page - Math.floor(MAX_VISIBLE / 2));
    let end = start + MAX_VISIBLE - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - MAX_VISIBLE + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  // Al llegar datos nuevos se quita el loading; si el backend respondió error se muestra su message
  useEffect(() => {
    setFeedback(errorMessage ? "error" : null);
    setFeedbackMsg(errorMessage ?? "");
  }, [searchParamsString, errorMessage]);

  const pushParams = useCallback((params: URLSearchParams) => {
    router.push(`/app/employeeDirectory?${params.toString()}`);
  }, [router]);

  const goToPage = (nextPage: number) => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");
    const params = new URLSearchParams(searchParamsString);
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    pushParams(params);
  };

  const handleSearch = useCallback(
    (value: string) => {
      if (value === currentSearch) return;

      setFeedback("loading");
      setFeedbackMsg("Buscando...");

      const params = new URLSearchParams(searchParamsString);
      params.set("page", "1");
      params.set("limit", String(limit));

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      pushParams(params);
    },
    [currentSearch, searchParamsString, limit, pushParams]
  );

  // Filtro por sucursal
  const handleBranchFilter = useCallback((value: string) => {
    if (value === currentBranch) return;

    setFeedback("loading");
    setFeedbackMsg("Filtrando...");

    const params = new URLSearchParams(searchParamsString);
    params.set("page", "1");
    params.set("limit", String(limit));

    if (value) {
      params.set("branch", value);
    } else {
      params.delete("branch");
    }
    pushParams(params);
  }, [currentBranch, searchParamsString, limit, pushParams]);

  // Filtro por departamento
  const handleDepartmentFilter = useCallback((value: string) => {
    if (value === currentIdDepartment) return;

    setFeedback("loading");
    setFeedbackMsg("Filtrando...");

    const params = new URLSearchParams(searchParamsString);
    params.set("page", "1");
    params.set("limit", String(limit));

    if (value) {
      params.set("idDepartment", value);
    } else {
      params.delete("idDepartment");
    }
    pushParams(params);
  }, [currentIdDepartment, searchParamsString, limit, pushParams]);

  const selectedBranchName = useMemo(() => {
    if (!currentBranch) return "Sucursales";
    const found = branches.find((br) => String(br.id) === currentBranch);
    return found ? found.name : "Sucursales";
  }, [currentBranch, branches]);

  const selectedDepartmentName = useMemo(() => {
    if (!currentIdDepartment) return "Departamentos";
    const found = departments.find((dep) => String(dep.id) === currentIdDepartment);
    return found ? found.nameDepartment : "Departamentos";
  }, [currentIdDepartment, departments]);

  const hasFilters = !!(search || currentBranch || currentIdDepartment);

  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg} />
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
            <h1 className="mb-0">Directorio</h1>

            <span className="text-muted">
              {total} empleado{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} xl={12} xxl={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-3 p-md-5">
                <Row className="mb-4 g-3">

                  {/* BUSCADOR */}
                  <Col xs={12} lg={6} style={{ minWidth: 0 }}>
                    <Card className="border rounded-4 h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-person text-primary" />
                          <span className="fw-semibold small">Buscar empleado</span>
                        </div>

                        <InputGroup>
                          <InputGroup.Text
                            className="bg-gray"
                            style={{ color: "#6c757d" }}
                          >
                            <i className="bi bi-search" />
                          </InputGroup.Text>
                          <GenericSearchInput
                            initialValue={search}
                            onSearch={handleSearch}
                            placeholder="Buscar por nombre, extensión, correo o celular"
                          />
                        </InputGroup>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* FILTRO DE SUCURSALES */}
                  <Col xs={12} sm={6} lg={3} style={{ minWidth: 0 }}>
                    <Card className="rounded-4 border h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-building text-primary" />
                          <span className="fw-semibold small">Filtrar por sucursal</span>
                        </div>

                        <Dropdown className="w-100">
                          <Dropdown.Toggle
                            as={Button}
                            variant="outline-secondary"
                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                            style={{ minWidth: 0 }}
                          >
                            <span style={{ ...wrapStyle, textAlign: "left" }}>
                              {selectedBranchName}
                            </span>
                          </Dropdown.Toggle>

                          <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                            <Dropdown.Item
                              active={!currentBranch}
                              onClick={() => handleBranchFilter("")}
                            >
                              <span className="text-uppercase text-muted">TODOS</span>
                            </Dropdown.Item>

                            {branches.map((br) => (
                              <Dropdown.Item
                                key={br.id}
                                active={String(br.id) === currentBranch}
                                onClick={() => handleBranchFilter(String(br.id))}>
                                <span className="text-uppercase">
                                  {br.name}
                                </span>
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* FILTRO DE DEPARTAMENTOS */}
                  <Col xs={12} sm={6} lg={3} style={{ minWidth: 0 }}>
                    <Card className="rounded-4 border h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-columns-gap text-primary" />
                          <span className="fw-semibold small">Filtrar por departamento</span>
                        </div>

                        <Dropdown className="w-100">
                          <Dropdown.Toggle
                            as={Button}
                            variant="outline-secondary"
                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                            style={{ minWidth: 0 }}
                          >
                            <span style={{ ...wrapStyle, textAlign: "left" }}>
                              {selectedDepartmentName}
                            </span>
                          </Dropdown.Toggle>

                          <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                            <Dropdown.Item
                              active={!currentIdDepartment}
                              onClick={() => handleDepartmentFilter("")}
                            >
                              <span className="text-uppercase text-muted">TODOS</span>
                            </Dropdown.Item>

                            {departments.map((dep) => (
                              <Dropdown.Item
                                key={dep.id}
                                active={String(dep.id) === currentIdDepartment}
                                onClick={() => handleDepartmentFilter(String(dep.id))}>
                                <span className="text-uppercase">
                                  {dep.nameDepartment}
                                </span>
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* LISTA VACÍA */}
                <ConditionalRender cond={employees.length === 0}>
                  <div className="text-center py-5 text-muted border rounded-3">
                    <i
                      className={`bi ${hasFilters ? "bi-clipboard-x" : "bi-inbox"} d-block mb-2`}
                      style={{ fontSize: "2.5rem" }}
                    />
                    <span className="fw-semibold">
                      {hasFilters
                        ? "No se encontró ningún empleado con los filtros aplicados"
                        : "No hay empleados en el directorio"}
                    </span>
                  </div>
                </ConditionalRender>

                {/* TARJETAS: 1 columna en celular, 2 en tablet, 3-4 en escritorio */}
                <Row xs={1} md={2} xl={3} xxl={4} className="g-3">
                  {employees.map((employee) => (
                    <Col key={employee.id}>
                      <DirectoryCard employee={employee} />
                    </Col>
                  ))}
                </Row>

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4">
                  <small className="text-muted">
                    Página {page} de {totalPages}
                  </small>

                  <ConditionalRender cond={totalPages > 1}>
                    <Pagination size="sm" className="m-0">
                      <Pagination.Prev
                        disabled={page <= 1}
                        onClick={() => goToPage(page - 1)}
                      >
                        Anterior
                      </Pagination.Prev>

                      {/* Primera página + … si la ventana no empieza en 1 */}
                      <ConditionalRender cond={visiblePages[0] > 1}>
                        <Pagination.Item onClick={() => goToPage(1)}>1</Pagination.Item>
                        <ConditionalRender cond={visiblePages[0] > 2}>
                          <Pagination.Ellipsis disabled />
                        </ConditionalRender>
                      </ConditionalRender>

                      {visiblePages.map((num) => (
                        <Pagination.Item
                          key={num}
                          active={num === page}
                          onClick={() => goToPage(num)}
                        >
                          {num}
                        </Pagination.Item>
                      ))}

                      {/* … + última página si la ventana no termina en totalPages */}
                      <ConditionalRender cond={visiblePages[visiblePages.length - 1] < totalPages}>
                        <ConditionalRender cond={visiblePages[visiblePages.length - 1] < totalPages - 1}>
                          <Pagination.Ellipsis disabled />
                        </ConditionalRender>
                        <Pagination.Item onClick={() => goToPage(totalPages)}>{totalPages}</Pagination.Item>
                      </ConditionalRender>

                      <Pagination.Next
                        disabled={page >= totalPages}
                        onClick={() => goToPage(page + 1)}
                      >
                        Siguiente
                      </Pagination.Next>
                    </Pagination>
                  </ConditionalRender>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
