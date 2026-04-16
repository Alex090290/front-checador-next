"use client";

import { ActionResponse, Employee, IInability } from "@/lib/definitions";
import { formatDate } from "date-fns";
import {
  FieldGroup,
  FormBook,
  FormPage,
  PageSheet,
} from "@/components/templates/FormView";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import ST7V1Card from "@/app/(auth)/app/inability/views/ST7V1Card";
import ST7V2Card from "@/app/(auth)/app/inability/views/ST7V2Card";
import ST2Card from "@/app/(auth)/app/inability/views/ST2Card";
import ModalAddDocuments from "@/app/(auth)/app/inability/views/ModalUploadDocuments";
import InhabilityDocCard from "@/app/(auth)/app/inability/views/InhabilityDocumentCard";
import ModalBlur from "@/components/ModalBlur";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import FormUpdateInability from "./inabilityFormUpdate";
import { updateInability } from "@/app/actions/inability-actions";
import toast from "react-hot-toast";
import { useModals } from "@/context/ModalContext";

type TInputs = {
  idEmployee: number | null;
  disabilityCategory: string;
  folio: string;
  typeOfDisability: string;
  dateInit: string;
  dateEnd: string;
  firstDoc: FileList | null;
};

function formatText(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatDateValue(value?: string | Date | null, pattern = "dd/MM/yyyy") {
  if (!value) return "-";

  try {
    return formatDate(new Date(value), pattern);
  } catch {
    return String(value);
  }
}

function InfoItem({
  label,
  value,
  className = "",
  uppercase = true,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
  uppercase?: boolean;
}) {
  return (
    <div className={className}>
      <div className="text-secondary-emphasis fw-semibold mb-1">{label}</div>
      <div className={uppercase ? "fw-medium text-uppercase" : "fw-medium"}>
        {value ?? "-"}
      </div>
    </div>
  );
}

export default function InfoOneInability({
  inhability,
  employees = [],
  id,
}: {
  inhability: IInability | null;
  employees?: Employee[];
  id: string;
}) {
  const [modalUploadDoc, setModalUploadDoc] = useState(false);
  const [showUpdateInabilityModal, setShowUpdateInabilityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const { modalError } = useModals();
  const router = useRouter();

  if (!inhability) {
    return (
      <div className="py-4">
        <h4 className="mb-0">Incapacidad no encontrada</h4>
      </div>
    );
  }

  const employee =
    employees.find((em) => Number(em.id) === Number(inhability.idEmployee)) ||
    inhability.employee;

  const firstDocument = inhability.documentsInability?.[0];

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/inability/create");
  };

  const handleUpdateInability = async (
    data: TInputs
  ): Promise<ActionResponse<boolean | null>> => {
    if (!inhability?.id) {
      return {
        success: false,
        message: "No se encontró la incapacidad",
        data: null,
      };
    }

    const res = await updateInability(Number(inhability.id), data);

    if (!res.success) {
      modalError(res.message);
      return {
        success: false,
        message: res.message,
        data: null,
      };
    }

    toast.success(res.message);

    return {
      success: true,
      message: res.message,
      data: true,
    };
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Cargando..."} />
      </ConditionalRender>

      <div className="mb-4">
        <h1 className="mb-0 text-white">
          {employee
            ? `${employee.name ?? ""} ${employee.lastName ?? ""}`.trim()
            : "Incapacidad"}
        </h1>
      </div>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={handleCreate}
          disabled={loading}
        >
          <i className="bi bi-plus-lg me-2" />
          Crear Incapacidad
        </Button>

        {id !== "null" && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowUpdateInabilityModal(true)}
            disabled={loading}
          >
            <i className="bi bi-pencil me-2" />
            Actualizar Incapacidad
          </Button>
        )}
      </div>

      <FormBook dKey="general">
        <FormPage title="Información general" eventKey="general">
          <PageSheet>
            <FieldGroup>
              <InfoItem
                label="Empleado:"
                value={
                  employee
                    ? `${employee.lastName ?? ""} ${employee.name ?? ""}`.trim()
                    : "-"
                }
              />

              <FieldGroup.Stack>
                <InfoItem
                  label="Categoría:"
                  value={formatText(inhability.disabilityCategory)}
                />
                <InfoItem
                  label="Tipo:"
                  value={formatText(inhability.typeOfDisability)}
                />
              </FieldGroup.Stack>

              <FieldGroup.Stack>
                <InfoItem
                  label="Fecha inicio:"
                  value={formatDateValue(firstDocument?.dateInit, "yyyy-MM-dd")}
                  uppercase={false}
                />
                <InfoItem
                  label="Fecha fin:"
                  value={formatDateValue(firstDocument?.dateEnd, "yyyy-MM-dd")}
                  uppercase={false}
                />
              </FieldGroup.Stack>

              <FieldGroup.Stack>
                <InfoItem
                  label="Folio CITT:"
                  value={formatText(inhability.folio || firstDocument?.folio)}
                />
                <InfoItem
                  label="Estatus:"
                  value={formatText(inhability.status)}
                />
              </FieldGroup.Stack>
            </FieldGroup>
          </PageSheet>
        </FormPage>

        {id !== "null" && (
          <FormPage title="Formatos" eventKey="formats">
            <PageSheet className="mt-2">
              <ST7V1Card
                st2v1Doc={inhability?.sT7FillingDocumentv1}
                idDoc={id}
              />
              <ST7V2Card
                st2v2Doc={inhability?.sT7FillingDocumentv2}
                idDoc={id}
              />
              <ST2Card
                st2Doc={inhability?.sT2DischargeDocument}
                idDoc={id}
              />
            </PageSheet>
          </FormPage>
        )}

        {id !== "null" && inhability?.documentsInability?.length > 0 && (
          <FormPage title="Documentos CITT" eventKey="documents">
            <Container fluid>
              <Row className="mt-2 mb-2">
                <Col md="12">
                  <Button
                    onClick={() => setModalUploadDoc(!modalUploadDoc)}
                    variant="info"
                  >
                    Nuevo documento CITT
                  </Button>
                </Col>
              </Row>

              <Row className="g-2">
                {inhability.documentsInability.map((doc) => (
                  <InhabilityDocCard
                    key={doc.id}
                    selfId={String(doc.id)}
                    idDoc={id}
                    urlDocument={doc.urlDocument}
                    dateInit={doc.dateInit}
                    dateEnd={doc.dateEnd}
                    folio={doc.folio}
                  />
                ))}
              </Row>
            </Container>
          </FormPage>
        )}
      </FormBook>

      {showUpdateInabilityModal && (
        <ModalBlur onClose={() => setShowUpdateInabilityModal(false)}>
          <FormUpdateInability
            show={showUpdateInabilityModal}
            onHide={() => setShowUpdateInabilityModal(false)}
            sendData={handleUpdateInability}
            inhability={inhability}
            employees={employees}
          />
        </ModalBlur>
      )}

    {modalUploadDoc && (
    <ModalBlur onClose={() => setModalUploadDoc(false)}>
        <ModalAddDocuments
        onHide={() => setModalUploadDoc(false)}
        idDoc={id}
        />
    </ModalBlur>
    )}
    </>
  );
}