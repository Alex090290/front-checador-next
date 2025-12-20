"use client";

import { createVacation } from "@/app/actions/vacations-actions";
import {
  Entry,
  FieldSelect,
  RelationField,
  SignatureInput,
} from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, PeriodVacation, Vacations } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import SignaturesVacationView from "./SignaturesVacationView";
import { Container, Row } from "react-bootstrap";
import ApproveVacationLeaderModal from "./ApproveVacationLeaderModal";
import SignatureVacationDohModal from "./SignatureDohModal";
import VacationPDFownload from "./VacationPDFownload";
import { fetchPeriods } from "@/app/actions/vacations-actions";

type TInputs = Pick<
  Vacations,
  | "idEmployee"
  | "idLeader"
  | "idPersonDoh"
  | "idPeriod"
  | "periodDescription"
  | "dateInit"
  | "dateEnd"
> & {
  incidence: string;
  signature: string;
};

function VacationsFormView({
  vacation,
  id,
  employees,
}: {
  vacation: Vacations | null;
  id: string;
  employees: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    getValues,
    formState: { isDirty, isSubmitting },
  } = useForm<TInputs>();

  const dateInit = watch("dateInit");
  const idEmployeeSelected = watch("idEmployee");

  const { data: session } = useSession();

  const { modalError } = useModals();

  const router = useRouter();

  const [approveModal, setApproveModal] = useState(false);
  const [periods, setPeriods] = useState<PeriodVacation[]>([]);
  const [signatureDohModal, setSignatureDohModal] = useState(false);
  const [vacationPDFModal, setVacationPDFModal] = useState(false);

  const originalValuesRef = useRef<TInputs | null>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (id && id === "null") {
      const res = await createVacation({ data });
      if (!res.success) return modalError(res.message);
      toast.success(res.message);
      router.back();
    } else {
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const handleApprove = () => {
    setApproveModal(!approveModal);
  };

  const handleSignatureDoh = () => {
    setSignatureDohModal(!signatureDohModal);
  };

  const handleEmployeeSignature = () => {};

  const getSignatureEmployee = () => {
    let result = false;
    const sign = vacation?.signatures.filter(
      (f) => f.idSignatory === Number(session?.user?.idEmployee)
    )[0];

    if (sign?.url === "") {
      result = false;
    } else {
      result = true;
    }

    return result;
  };

  const handleDownloadPDF = () => {
    setVacationPDFModal(!vacationPDFModal);
  };

  useEffect(() => {
    if (!vacation) {
      const values: TInputs = {
        idEmployee: Number(session?.user?.id),
        idLeader: null,
        idPersonDoh: null,
        idPeriod: null,
        dateEnd: "",
        dateInit: "",
        incidence: "VACACIONES",
        periodDescription: "",
        signature: "",
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        idEmployee: vacation.idEmployee,
        idLeader: vacation.idLeader,
        idPersonDoh: vacation.idPersonDoh,
        idPeriod: vacation?.period.id ?? null,
        dateEnd: formatDate(vacation.dateEnd, "yyyy-MM-dd") ?? "",
        dateInit: formatDate(vacation.dateInit, "yyyy-MM-dd") ?? "",
        incidence: vacation.holidayName,
        periodDescription: vacation.period.periodDescription,
        signature: "",
      };

      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, vacation, session?.user]);

  const getPeriods = async () => {
    try {
      if (!idEmployeeSelected) {
        setPeriods([]); // si no hay empleado, limpia
        return;
      }

      const res = await fetchPeriods({
        idEmployee: Number(idEmployeeSelected),
      });

      setPeriods(res ?? []);
      console.log(res.find((p) => p.id === getValues().idPeriod));
    } catch (error) {
      console.error(error);
      setPeriods([]);
    }
  };

  useEffect(() => {
    getPeriods();
  }, [idEmployeeSelected, vacation]);

  return (
    <>
      <FormView
        cleanUrl="/app/vacations?view_type=form&id=null"
        disabled={isSubmitting}
        id={Number(id)}
        isDirty={isDirty}
        name={getValues().incidence}
        onSubmit={handleSubmit(onSubmit)}
        reverse={handleReverse}
        actions={[
          {
            action: handleApprove,
            string: "Aprobar",
            variant: "warning",
            invisible:
              vacation?.idLeader !== Number(session?.user?.idEmployee) ||
              vacation.leaderApproval === "APPROVED",
          },
          {
            action: handleSignatureDoh,
            string: "Aprobar",
            variant: "success",
            invisible: session?.user?.idEmployee !== vacation?.idPersonDoh,
          },
          {
            action: handleEmployeeSignature,
            string: "Firmar",
            variant: "primary",
            invisible:
              session?.user?.idEmployee !== vacation?.employee.id ||
              getSignatureEmployee(),
          },
          {
            action: handleDownloadPDF,
            variant: "primary",
            string: (
              <>
                <i className="bi bi-filetype-pdf me-2"></i>
                <span>Descargar</span>
              </>
            ),
          },
        ]}
      >
        <FieldGroup>
          <RelationField
            register={register("idEmployee")}
            options={employees.map((e) => ({
              id: Number(e.id),
              displayName: `${e.lastName} ${e.name}`.toUpperCase(),
              name: `${e.lastName} ${e.name}`.toUpperCase(),
            }))}
            label="Empleado"
            callBackMode="id"
            control={control}
          />
          <FieldGroup.Stack>
            <RelationField
              register={register("idLeader")}
              options={employees.map((e) => ({
                id: Number(e.id),
                displayName: `${e.lastName} ${e.name}`.toUpperCase(),
                name: `${e.lastName} ${e.name}`.toUpperCase(),
              }))}
              label="Líder"
              callBackMode="id"
              control={control}
            />
            <FieldSelect
              label="Periodo"
              options={periods.map((p) => ({
                label: p.periodDescription,
                value: Number(p.id), // el DOM usa string
              }))}
              register={register("idPeriod", {
                required: true,
              })}
            />
            <RelationField
              register={register("idPersonDoh")}
              options={employees.map((e) => ({
                id: Number(e.id),
                displayName: `${e.lastName} ${e.name}`.toUpperCase(),
                name: `${e.lastName} ${e.name}`.toUpperCase(),
              }))}
              label="D.O.H."
              callBackMode="id"
              control={control}
            />
          </FieldGroup.Stack>
          {/* <Entry label="Descripción" register={register("periodDescription")} /> */}
          <FieldGroup.Stack>
            <Entry label="Inicio" type="date" register={register("dateInit")} />
            <Entry
              label="Final"
              type="date"
              register={register("dateEnd")}
              min={dateInit}
            />
          </FieldGroup.Stack>
          {id === "null" && (
            <SignatureInput
              name="signature"
              register={register}
              control={control}
            />
          )}
        </FieldGroup>
        <FormBook dKey="signatures">
          {vacation?.signatures && vacation.signatures.length > 0 && (
            <FormPage title="Firmas" eventKey="signatures">
              <Container>
                <Row className="g-2 py-2">
                  {vacation?.signatures &&
                    vacation?.signatures.map((sign) => {
                      return (
                        <SignaturesVacationView
                          key={sign.id}
                          idSolicitud={vacation.id}
                          idPeriod={vacation.period.id}
                          idEmployee={sign.idSignatory}
                          name={sign.name}
                          status={sign.status}
                        />
                      );
                    })}
                </Row>
              </Container>
            </FormPage>
          )}
        </FormBook>
      </FormView>
      <ApproveVacationLeaderModal
        id={id}
        idPeriod={Number(vacation?.idPeriod)}
        show={approveModal}
        onHide={() => setApproveModal(!approveModal)}
      />
      <SignatureVacationDohModal
        show={signatureDohModal}
        onHide={() => setSignatureDohModal(!setSignatureDohModal)}
        id={id}
        idPeriod={Number(vacation?.idPeriod)}
      />
      <VacationPDFownload
        show={vacationPDFModal}
        onHide={() => setVacationPDFModal(!vacationPDFModal)}
        id={id}
      />
    </>
  );
}

export default VacationsFormView;
