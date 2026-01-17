"use client";

import {
  createInability,
  updateInability,
} from "@/app/actions/inability-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
  PageSheet,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, IInability } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ST7V1Card from "./ST7V1Card";
import ST7V2Card from "./ST7V2Card";
import ST2Card from "./ST2Card";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import ModalAddDocuments from "./ModalUploadDocuments";
import InhabilityDocCard from "./InhabilityDocumentCard";
import DocumetCitt from "./DocumetCitt";
import { useSessionSnapshot } from "@/hooks/useSessionStore";

type TInputs = {
  idEmployee: number | null;
  disabilityCategory: string;
  typeOfDisability: string;
  dateInit: string;
  dateEnd: string;
  firstDoc: FileList | null;
};

function InhabilityFormView({
  inhability,
  id,
  employees,
}: {
  inhability: IInability | null;
  id: string;
  employees: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isDirty, isSubmitting },
  } = useForm<TInputs>();

  const onChangeDateInit = watch("dateInit");

  const session = useSessionSnapshot();
  const sessionEmployeeId = Number(session?.uid?.idEmployee);

  const { modalError } = useModals();

  const router = useRouter();

  const originalValuesRef = useRef<TInputs | null>(null);

  const [modalUploadDoc, setModalUploadDoc] = useState(false);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (id && id === "null") {
      const res = await createInability(data);
      if (!res.success) return modalError(res.message);
      toast.success(res.message);
      router.push("/app/inability?view_type=list&id=null");
    } else {
      const res = await updateInability(Number(id), data);
      if (!res.success) return modalError(res.message);
      toast.success(res.message);
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!inhability) {
      const values: TInputs = {
        idEmployee:
          session?.uid?.role === "EMPLOYEE" ? sessionEmployeeId : null,
        disabilityCategory: "",
        typeOfDisability: "Inicial",
        dateInit: "",
        dateEnd: "",
        firstDoc: null,
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        idEmployee: inhability.idEmployee,
        disabilityCategory: inhability.disabilityCategory,
        typeOfDisability: inhability.typeOfDisability,
        firstDoc: null,
        dateInit: formatDate(
          inhability.documentsInability[0].dateInit,
          "yyyy-MM-dd",
        ),
        dateEnd: formatDate(
          inhability.documentsInability[0].dateEnd,
          "yyyy-MM-dd",
        ),
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, inhability, session, sessionEmployeeId]);

  return (
    <>
      <FormView
        cleanUrl="/app/inability?view_type=form&id=null"
        disabled={isSubmitting}
        id={Number(id)}
        isDirty={isDirty}
        name={inhability?.disabilityCategory ?? null}
        onSubmit={handleSubmit(onSubmit)}
        reverse={handleReverse}
      >
        <FieldGroup>
          <RelationField
            callBackMode="id"
            control={control}
            label="Empleado"
            options={employees.map((em) => ({
              id: Number(em.id),
              displayName: `${em.lastName} ${em.name}`.toUpperCase(),
              name: `${em.lastName} ${em.name}`.toUpperCase(),
            }))}
            register={register("idEmployee", { required: true })}
            readonly={session?.uid?.role === "EMPLOYEE" || !id}
          />
          <FieldGroup.Stack>
            <FieldSelect
              label="Categoría:"
              options={[
                { label: "Enfermedad general", value: "enfermedad general" },
                { label: "Riesgo de trabajo", value: "riesgo de trabajo" },
                { label: "Maternidad", value: "maternidad" },
              ]}
              register={register("disabilityCategory", { required: true })}
              readonly={session?.uid?.role === "EMPLOYEE" || !id}
            />

            <FieldSelect
              label="Tipo:"
              options={[
                { label: "Inicial", value: "inicial" },
                { label: "Subsecuente", value: "subsecuente" },
                { label: "Alta", value: "alta" },
              ]}
              register={register("typeOfDisability", { required: true })}
              readonly={session?.uid?.role === "EMPLOYEE" || !id}
            />
          </FieldGroup.Stack>
          <FieldGroup.Stack>
            <Entry
              label="Fecha inicio:"
              type="date"
              register={register("dateInit", { required: true })}
              readonly={session?.uid?.role === "EMPLOYEE" || !id}
            />
            <Entry
              label="Fecha fin:"
              type="date"
              min={onChangeDateInit}
              register={register("dateEnd", { required: true })}
              readonly={session?.uid?.role === "EMPLOYEE" || !id}
            />
          </FieldGroup.Stack>
          {!inhability?.documentsInability[0].urlDocument && (
            <Form.Group className="mt-3">
              {/* CARGA DE DOCUMENTO */}
              <Form.Label className="fw-semibold">Documento:</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.webp"
                {...register("firstDoc")}
              />
            </Form.Group>
          )}
        </FieldGroup>
        <FormBook dKey="formats">
          {id && id !== "null" && (
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
                <ST2Card st2Doc={inhability?.sT2DischargeDocument} idDoc={id} />
                <DocumetCitt documetCitt={inhability?.documetCitt} idDoc={id} />
              </PageSheet>
            </FormPage>
          )}
          {id &&
            id !== "null" &&
            inhability?.documentsInability[0].urlDocument !== "" && (
              <FormPage title="Documentos" eventKey="documents">
                <Container fluid>
                  <Row className="mt-2 mb-2">
                    <Col md="12">
                      <Button
                        onClick={() => setModalUploadDoc(!modalUploadDoc)}
                        variant="info"
                      >
                        Nuevo documento
                      </Button>
                    </Col>
                  </Row>
                  <Row className="g-2">
                    {inhability &&
                      inhability.documentsInability.map((doc) => {
                        return (
                          <InhabilityDocCard
                            key={doc.id}
                            selfId={String(doc.id)}
                            idDoc={id}
                            urlDocument={doc.urlDocument}
                            dateInit={doc.dateInit}
                            dateEnd={doc.dateEnd}
                          />
                        );
                      })}
                  </Row>
                </Container>
              </FormPage>
            )}
        </FormBook>
      </FormView>
      <ModalAddDocuments
        show={modalUploadDoc}
        onHide={() => setModalUploadDoc(!modalUploadDoc)}
        idDoc={id}
      />
    </>
  );
}

export default InhabilityFormView;
