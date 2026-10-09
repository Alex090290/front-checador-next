"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import {
  ITermsAndConditions,
  LEGAL_DOCUMENT_LABELS,
  TLegalDocumentType,
} from "@/lib/termsAndConditions/interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, InputGroup, Pagination, Row } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import ModalBlur from "../ModalBlur";
import OverLay from "../templates/OverLay";
import GenericSearchInput from "../employee/GenericSearchInput";
import { useRouter, useSearchParams } from "next/navigation";
import { useModals } from "@/context/ModalContext";
import { deleteTerms, updateTerms } from "@/app/actions/termsAndConditions-actions";
import CreateTermsModal from "./CreateTermsModal";
import UpdateTermsModal from "./UpdateTermsModal";

type FeedbackState = "loading" | "success" | "error" | null;

export default function TermsTableClient({
  terms,
  total,
  page,
  limit,
  type,
  search,
}: {
  terms: ITermsAndConditions[];
  total: number;
  page: number;
  limit: number;
  type?: TLegalDocumentType | "";
  search?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();
  const currentSearch = sp.get("search") ?? "";
  const { modalConfirm } = useModals();

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [idRegister, setIdRegister] = useState<number | null>(null);
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

  useEffect(() => {
    setFeedback(null);
    setFeedbackMsg("");
  }, [searchParamsString]);

  const goToPage = (nextPage: number) => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");
    const params = new URLSearchParams(searchParamsString);
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/termsAndConditionsAdmin?${params.toString()}`);
  };

  const handleSearch = useCallback(
    (value: string) => {
      if (value === currentSearch) return;

      setFeedback("loading");
      setFeedbackMsg("Buscando...");

      const params = new URLSearchParams(searchParamsString);
      params.set("id", "null");
      params.set("page", "1");

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`/app/termsAndConditionsAdmin?${params.toString()}`);
    },
    [currentSearch, searchParamsString, router]
  );

  const handleType = (value: string) => {
    setFeedback("loading");
    setFeedbackMsg("Buscando...");

    const params = new URLSearchParams(searchParamsString);
    params.set("id", "null");
    params.set("page", "1");

    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    router.push(`/app/termsAndConditionsAdmin?${params.toString()}`);
  };

  const handleView = (id: number) => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");
    router.push(`/app/termsAndConditionsAdmin?view_type=form&id=${id}`);
  };

  const handleUpdate = (id: number) => {
    setIdRegister(id);
    setShowModalUpdate(true);
  };

  const handlePublish = (row: ITermsAndConditions, isActive: boolean) => {
    const label = LEGAL_DOCUMENT_LABELS[row.type];
    const message = isActive
      ? `¿Seguro que quieres publicar este documento? El ${label.toLowerCase()} vigente actual dejará de estarlo.`
      : "¿Seguro que quieres desactivar este documento?";

    modalConfirm(message, async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg(isActive ? "Publicando documento..." : "Desactivando documento...");

        const res = await updateTerms(Number(row.id), { isActive });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo actualizar el documento");
          setFeedback("error");
          router.refresh();
          return;
        }

        setFeedbackMsg(res.message || "Documento actualizado correctamente");
        setFeedback("success");
        router.refresh();
      } catch (error) {
        console.log(error);

        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      }
    });
  };

  const handleDelete = (id: number) => {
    modalConfirm("¿Seguro que quieres eliminar el documento?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Eliminando documento...");

        const res = await deleteTerms(id);

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo eliminar");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Eliminado correctamente");
        setFeedback("success");
        router.refresh();
      } catch (error) {
        console.log(error);

        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      }
    });
  };

  const columns: TableTemplateColumn<ITermsAndConditions>[] = [
    {
      key: "type",
      label: "Tipo",
      accessor: (r) => r.type,
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-nowrap">{LEGAL_DOCUMENT_LABELS[r.type] ?? r.type}</div>
      ),
    },
    {
      key: "title",
      label: "Título",
      accessor: (r) => r.title,
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-break" style={{ minWidth: 180 }}>{r.title}</div>
      ),
    },
    {
      key: "version",
      label: "Versión",
      accessor: (r) => r.version,
      filterable: false,
      type: "number",
      render: (r) => <div>v{r.version}</div>,
    },
    {
      key: "isActive",
      label: "Estado",
      accessor: (r) => r.isActive,
      filterable: false,
      type: "string",
      render: (r) => r.isActive ? (
        <span className="badge rounded-pill px-2 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
          Vigente
        </span>
      ) : (
        <span className="badge rounded-pill px-2 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
          Inactivo
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Última actualización",
      accessor: (r) => r.updatedAt ?? r.createdAt,
      filterable: false,
      type: "string",
      render: (r) => <div className="text-nowrap">{r.updatedAt || r.createdAt || "-"}</div>,
    },
  ];

  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <Container className="py-3" style={{ maxWidth: "1600px" }}>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
            onClick={() => setShowModalCreate(true)}
          >
            <i className="bi bi-plus-lg" />
            Nuevo
          </Button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Documentos legales</h1>

            <span className="text-muted">
              {total} documento{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} xl={12} xxl={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-4 p-md-5">

                <Row className="justify-content-left mb-3 g-3">
                  {/* FILTRO POR TIPO */}
                  <Col xs={12} md={6} lg={4}>
                    <Card className="border rounded-4 h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-file-earmark-text text-primary" />
                          <span className="fw-semibold small">Filtrar por tipo</span>
                        </div>

                        <Form.Select
                          className="shadow-sm border-1 border-secondary"
                          value={type ?? ""}
                          onChange={(e) => handleType(e.target.value)}
                        >
                          <option value="">Todos</option>
                          <option value="TERMINOS">{LEGAL_DOCUMENT_LABELS.TERMINOS}</option>
                          <option value="PRIVACIDAD">{LEGAL_DOCUMENT_LABELS.PRIVACIDAD}</option>
                        </Form.Select>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* BUSCADOR POR TÍTULO */}
                  <Col xs={12} md={6} lg={4}>
                    <Card className="border rounded-4 h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-search text-primary" />
                          <span className="fw-semibold small">Buscar por título</span>
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
                            placeholder="Buscar por título..."
                          />
                        </InputGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <ListView>
                  <ListView.Body>
                    <div className="table-responsive rounded-3 border overflow-auto">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark border-secondary">
                          <tr>
                            {columns.map((column) => (
                              <th
                                key={String(column.key)}
                                className="fw-bold text-left text-nowrap"
                              >
                                {column.label}
                              </th>
                            ))}

                            <th className="fw-bold text-center">Acciones</th>
                          </tr>
                        </thead>

                        <tbody>
                          <ConditionalRender cond={terms?.length === 0}>
                            <tr>
                              <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                                <i
                                  className={`bi ${search || type ? "bi-clipboard-x" : "bi-inbox"} d-block mb-2`}
                                  style={{ fontSize: "2.5rem" }}
                                />
                                <span className="fw-semibold">
                                  {search || type
                                    ? "No se encontró ningún documento con los filtros aplicados"
                                    : "No hay documentos registrados"}
                                </span>
                              </td>
                            </tr>
                          </ConditionalRender>

                          {(terms ?? []).map((row) => (
                            <tr key={row.id}>
                              {columns.map((column) => (
                                <td key={String(column.key)}>
                                  {column.render
                                    ? column.render(row)
                                    : String(column.accessor(row) ?? "")}
                                </td>
                              ))}

                              <td className="align-middle">
                                <div className="d-flex justify-content-center align-items-center gap-2">
                                  <OverLay string="Ver">
                                    <Button
                                      variant="outline-info"
                                      className="btn-sm d-inline-flex align-items-center"
                                      onClick={() => handleView(Number(row.id))}
                                    >
                                      <i className="bi bi-eye" />
                                      <span className="d-none d-lg-inline ms-1">Ver</span>
                                    </Button>
                                  </OverLay>

                                  <OverLay string="Editar">
                                    <Button
                                      variant="outline-primary"
                                      className="btn-sm d-inline-flex align-items-center"
                                      onClick={() => handleUpdate(Number(row.id))}
                                    >
                                      <i className="bi bi-pencil" />
                                      <span className="d-none d-lg-inline ms-1">Editar</span>
                                    </Button>
                                  </OverLay>

                                  <ConditionalRender cond={!row.isActive}>
                                    <OverLay string="Publicar">
                                      <Button
                                        variant="outline-success"
                                        className="btn-sm d-inline-flex align-items-center"
                                        onClick={() => handlePublish(row, true)}
                                      >
                                        <i className="bi bi-check-circle" />
                                        <span className="d-none d-lg-inline ms-1">Publicar</span>
                                      </Button>
                                    </OverLay>
                                  </ConditionalRender>

                                  <ConditionalRender cond={row.isActive}>
                                    <OverLay string="Desactivar">
                                      <Button
                                        variant="outline-warning"
                                        className="btn-sm d-inline-flex align-items-center"
                                        onClick={() => handlePublish(row, false)}
                                      >
                                        <i className="bi bi-slash-circle" />
                                        <span className="d-none d-lg-inline ms-1">Desactivar</span>
                                      </Button>
                                    </OverLay>
                                  </ConditionalRender>

                                  <ConditionalRender cond={!row.isActive}>
                                    <OverLay string="Eliminar">
                                      <Button
                                        variant="danger"
                                        className="btn-sm d-inline-flex align-items-center"
                                        onClick={() => handleDelete(Number(row.id))}
                                      >
                                        <i className="bi bi-trash" />
                                        <span className="d-none d-lg-inline ms-1">Eliminar</span>
                                      </Button>
                                    </OverLay>
                                  </ConditionalRender>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

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
                  </ListView.Body>
                </ListView>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <ConditionalRender cond={showModalCreate}>
          <ModalBlur onClose={() => setShowModalCreate(false)}>
            <CreateTermsModal
              show={showModalCreate}
              onHide={() => {
                setShowModalCreate(false);
                router.refresh();
              }}
            />
          </ModalBlur>
        </ConditionalRender>

        <ConditionalRender cond={showModalUpdate && idRegister !== null}>
          <ModalBlur onClose={() => setShowModalUpdate(false)}>
            <UpdateTermsModal
              show={showModalUpdate}
              onHide={() => {
                setShowModalUpdate(false);
                router.refresh();
              }}
              idRegister={Number(idRegister)}
            />
          </ModalBlur>
        </ConditionalRender>
      </Container>
    </>
  );
}
