"use client";

import { createVacation, fetchPeriods } from "@/app/actions/vacations-actions";
import { findEmployeeById } from "@/app/actions/employee-actions";
import { IConfigSystem } from "@/app/actions/configSystem-actions";
import {
  Entry,
  FieldSelect,
  RelationField,
  SignatureInput,
} from "@/components/fields";
import FormView, {
  FieldGroup,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, PeriodVacation, Vacations } from "@/lib/definitions";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { Form } from "react-bootstrap";
import useSWR from "swr";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreateVacationComponent({
  employees,
}: {
  employees: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    getValues,
    formState: { isDirty, isSubmitting },
  } = useForm<TInputs>();

  const dateInit = watch("dateInit");
  const idEmployeeSelected = watch("idEmployee");
  const idPeriodSelected = watch("idPeriod");

  const session = useSessionSnapshot();
  const { data } = useSWR("/api/configsystem", fetcher);

  const config: IConfigSystem | null = useMemo(() => {
    const maybe = data?.data?.[0];
    return maybe ?? null;
  }, [data]);

  const { modalError } = useModals();
  const router = useRouter();

  const [periods, setPeriods] = useState<PeriodVacation[]>([]);

  const originalValuesRef = useRef<TInputs | null>(null);

  // ✅ periodo seleccionado para mostrar stats
  const selectedPeriod = useMemo(() => {
    const pid = Number(idPeriodSelected);
    if (!pid || Number.isNaN(pid)) return null;
    return periods.find((p) => Number(p.id) === pid) ?? null;
  }, [idPeriodSelected, periods]);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    const res = await createVacation({ data });
    if (!res.success) return modalError(res.message);
    toast.success(res.message);
    router.back();
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    const values: TInputs = {
      idEmployee: Number(session?.uid?.id),
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
  }, [reset, session]);

  useEffect(() => {
    if (!idEmployeeSelected) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await findEmployeeById({ id: Number(idEmployeeSelected) });
        if (cancelled) return;

        const emp = res;
        if (!emp) return;

        const leaderFromConfig = config?.permissions?.approvalLeaders?.idPerson;

        if (emp.isLeader) {
          if (!leaderFromConfig) return;
          setValue("idLeader", Number(leaderFromConfig), { shouldDirty: true });
          return;
        }

        const leaderId = emp?.leader?.id ?? null;
        setValue("idLeader", leaderId ? Number(leaderId) : null, {
          shouldDirty: true,
        });
      } catch (e) {
        console.log(e);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [idEmployeeSelected, config, setValue]);

  useEffect(() => {
    const dohFromConfig = config?.permissions?.approvalDoh?.idPerson;
    if (!dohFromConfig) return;

    const currentDoh = watch("idPersonDoh");
    if (currentDoh) return;

    setValue("idPersonDoh", Number(dohFromConfig), { shouldDirty: false });
  }, [config, setValue, watch]);

  const getPeriods = useCallback(async () => {
    try {
      if (!idEmployeeSelected) {
        setPeriods([]);
        return;
      }

      const res = await fetchPeriods({
        idEmployee: Number(idEmployeeSelected),
      });

      const nextPeriods = (res ?? []) as PeriodVacation[];
      setPeriods(nextPeriods);

      // ✅ si aún no hay periodo, setear el primero
      const current = watch("idPeriod");
      const currentNum = Number(current);
      if (
        (!current || Number.isNaN(currentNum) || currentNum === 0) &&
        nextPeriods.length > 0
      ) {
        setValue("idPeriod", Number(nextPeriods[0].id), { shouldDirty: false });
      }
    } catch (error) {
      console.error(error);
      setPeriods([]);
    }
  }, [idEmployeeSelected, setValue, watch]);

  useEffect(() => {
    getPeriods();
  }, [getPeriods]);

  return (
    <>
      <FormView
        cleanUrl="/app/vacations?view_type=form&id=null"
        disabled={isSubmitting}
        id={0}
        isDirty={isDirty}
        name={getValues().incidence}
        onSubmit={handleSubmit(onSubmit)}
        reverse={handleReverse}
        actions={[]}
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
              label="Periodo Vacacional"
              options={periods.map((p) => ({
                label: p.periodDescription,
                value: Number(p.id),
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

          <FieldGroup.Stack>
            <Entry label="Inicio" type="date" register={register("dateInit")} />
            <Entry
              label="Final"
              type="date"
              register={register("dateEnd")}
              min={dateInit}
            />
          </FieldGroup.Stack>

          {selectedPeriod && (
            <FieldGroup.Stack>
              <Form.Group className="w-100">
                <Form.Label className="small text-muted">
                  Días aprobados usados
                </Form.Label>
                <Form.Control
                  value={String(selectedPeriod.usedDaysApproved ?? 0)}
                  disabled
                  readOnly
                />
              </Form.Group>

              <Form.Group className="w-100">
                <Form.Label className="small text-muted">
                  Días disponibles
                </Form.Label>
                <Form.Control
                  value={String(selectedPeriod.availableDays ?? 0)}
                  disabled
                  readOnly
                />
              </Form.Group>
            </FieldGroup.Stack>
          )}

          <SignatureInput name="signature" register={register} control={control} />
        </FieldGroup>
      </FormView>
    </>
  );
}

export default CreateVacationComponent;
