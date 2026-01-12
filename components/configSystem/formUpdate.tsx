"use client";

import { IConfigSystem } from "@/app/actions/configSystem-actions";
import { ActionResponse } from "@/lib/definitions";
import { Button, Card, Form, Badge } from "react-bootstrap";
import { Control, Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";

/** ======================
 *  Types
 *  ====================== */

type TInputs = {
  permissions_approvalDoh_idPerson: number;
  permissions_approvalLeaders_idPerson: number;
  permissions_extra_ids: number[];

  vacations_approvalDoh_idPerson: number;
  vacations_approvalLeaders_idPerson: number;
  vacations_extra_ids: number[];

  penalty_approvalDoh_idPerson: number;
  penalty_approvalLeaders_idPerson: number;
  penalty_extra_ids: number[];

  overTime_approvalDoh_idPerson: number;
  overTime_approvalLeaders_idPerson: number;
  overTime_extra_ids: number[];
};

const toNum = (v: unknown, fallback = 0) => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export type EmployeeLite = {
  _id?: string;
  id: number;
  name: string;
  lastName: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const empName = (e: EmployeeLite) => `${e.name ?? ""} ${e.lastName ?? ""}`.trim();

const fullNameFromConfig = (emp?: { name: string; lastName: string }) => {
  if (!emp) return "";
  return `${emp.name ?? ""} ${emp.lastName ?? ""}`.trim();
};

/** ======================
 *  EmployeeAutocomplete (single)
 *  ====================== */
export function EmployeeAutocomplete({
  employees,
  value,
  onChange,
  onTouched,
  placeholder,
  initialLabel,
  isEmployeesLoading,
  inputSize,
  inputClassName,
}: {
  employees: EmployeeLite[];
  value: number;
  onChange: (val: number) => void;
  onTouched?: () => void;
  placeholder?: string;
  initialLabel?: string;
  isEmployeesLoading?: boolean;
  inputSize?: "sm" | "lg";
  inputClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const userTypingRef = useRef(false);
  const pendingClearRef = useRef(false);

  const selected = useMemo(
    () => employees.find((e) => Number(e.id) === Number(value)),
    [employees, value]
  );

  useEffect(() => {
    if (userTypingRef.current) return;

    if (selected) {
      setQ(`${empName(selected)}`);
      return;
    }

    if (initialLabel && value) {
      setQ(`${initialLabel} (${value})`);
    } else if (value) {
      setQ(String(value));
    } else {
      setQ("");
    }
  }, [selected, initialLabel, value]);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(ev.target as Node)) {
        setOpen(false);
        userTypingRef.current = false;

        if (pendingClearRef.current && q.trim() === "") {
          onChange(0);
          pendingClearRef.current = false;
        }

        onTouched?.();
      }
    };

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onChange, onTouched, q]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return employees.slice(0, 15);

    return employees
      .filter((e) => {
        const name = empName(e).toLowerCase();
        const idStr = String(e.id);
        return name.includes(term) || idStr.includes(term);
      })
      .slice(0, 15);
  }, [employees, q]);

  const commitSelection = (e: EmployeeLite) => {
    const id = Number(e.id);

    pendingClearRef.current = false;
    onChange(id);
    onTouched?.();

    setQ(`${empName(e)}`);
    setOpen(false);
    userTypingRef.current = false;
  };

  return (
    <div ref={ref} className="position-relative">
      <Form.Control
        value={q}
        size={inputSize}
        className={inputClassName}
        placeholder={
          isEmployeesLoading ? "Cargando empleados..." : placeholder ?? "Buscar empleado..."
        }
        autoComplete="off"
        disabled={!!isEmployeesLoading}
        onFocus={() => {
          setOpen(true);
          userTypingRef.current = true;
        }}
        onChange={(e) => {
          const next = e.target.value;
          setQ(next);
          setOpen(true);
          userTypingRef.current = true;
          pendingClearRef.current = next.trim() === "";
        }}
      />

      {open && !isEmployeesLoading && (
        <div
          className="position-absolute w-100 bg-body border rounded mt-1 shadow-sm"
          style={{ zIndex: 20, maxHeight: 240, overflowY: "auto" }}
        >
          {filtered.length === 0 ? (
            <div className="p-2 text-muted small">Sin resultados</div>
          ) : (
            filtered.map((emp) => (
              <button
                key={emp._id ?? String(emp.id)}
                type="button"
                className="w-100 text-start btn btn-link text-decoration-none px-2 py-2"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                }}
                onClick={() => commitSelection(emp)}
              >
                <div className="fw-semibold">{empName(emp)}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** ======================
 *  EmployeeMultiSelect (idsExtra)
 *  ====================== */
function EmployeeMultiSelect({
  employees,
  value,
  onChange,
  placeholder,
  isEmployeesLoading,
}: {
  employees: EmployeeLite[];
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  isEmployeesLoading?: boolean;
}) {
  const selectedEmployees = useMemo(() => {
    const set = new Set(value.map(Number));
    return employees.filter((e) => set.has(Number(e.id)));
  }, [employees, value]);

  const addOne = (id: number) => {
    if (!id) return;
    const next = Array.from(new Set([...value.map(Number), Number(id)]));
    onChange(next);
  };

  const removeOne = (id: number) => {
    const next = value.filter((x) => Number(x) !== Number(id));
    onChange(next);
  };

  return (
    <div>
      {/* Para multi, siempre pasamos value=0 para que el input quede “libre” */}
      <EmployeeAutocomplete
        employees={employees}
        value={0}
        onChange={(id) => addOne(id)}
        placeholder={placeholder ?? "Agregar empleado extra..."}
        isEmployeesLoading={isEmployeesLoading}
      />

      <div className="mt-2 d-flex flex-wrap gap-2">
        {selectedEmployees.length === 0 ? (
          <div className="text-muted small">Sin empleados extra</div>
        ) : (
          selectedEmployees.map((e) => (
            <Badge key={e._id ?? String(e.id)} bg="secondary" className="d-inline-flex align-items-center gap-2">
              <span className="text-uppercase">{empName(e)}</span>
              <button
                type="button"
                className="btn btn-sm btn-link text-black p-0"
                onClick={() => removeOne(Number(e.id))}
                aria-label="Quitar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

/** ======================
 *  Field wrappers
 *  ====================== */
function EmployeeField({
  control,
  name,
  placeholder,
  initialLabel,
}: {
  control: Control<TInputs>;
  name:
    | "permissions_approvalDoh_idPerson"
    | "permissions_approvalLeaders_idPerson"
    | "vacations_approvalDoh_idPerson"
    | "vacations_approvalLeaders_idPerson"
    | "penalty_approvalDoh_idPerson"
    | "penalty_approvalLeaders_idPerson"
    | "overTime_approvalDoh_idPerson"
    | "overTime_approvalLeaders_idPerson";
  placeholder?: string;
  initialLabel?: string;
}) {
  const { data, isLoading } = useSWR("/api/employees", fetcher);
  const employees: EmployeeLite[] = data?.data ?? [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <EmployeeAutocomplete
          employees={employees}
          value={toNum(field.value)}
          onChange={(id) => field.onChange(id)}
          onTouched={() => field.onBlur()}
          placeholder={placeholder}
          initialLabel={initialLabel}
          isEmployeesLoading={isLoading}
        />
      )}
    />
  );
}

function EmployeeExtraField({
  control,
  name,
  placeholder,
}: {
  control: Control<TInputs>;
  name:
    | "permissions_extra_ids"
    | "vacations_extra_ids"
    | "penalty_extra_ids"
    | "overTime_extra_ids";
  placeholder?: string;
}) {
  const { data, isLoading } = useSWR("/api/employees", fetcher);
  const employees: EmployeeLite[] = data?.data ?? [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <EmployeeMultiSelect
          employees={employees}
          value={Array.isArray(field.value) ? field.value : []}
          onChange={(ids) => field.onChange(ids)}
          placeholder={placeholder}
          isEmployeesLoading={isLoading}
        />
      )}
    />
  );
}

/** ======================
 *  Main component
 *  ====================== */
export default function ConfigSystemUpdate({
  initialData,
  onCancel,
  onSave,
}: {
  initialData: IConfigSystem;
  onCancel: () => void;
  onSave: (payload: {
    permissions: { idPersonApproveDoh: number; idPersonApproveLeaders: number; idsExtra: number[] };
    vacations: { idPersonApproveDoh: number; idPersonApproveLeaders: number; idsExtra: number[] };
    penaltyForUnjustifiedAbsence: { idPersonApproveDoh: number; idPersonApproveLeaders: number; idsExtra: number[] };
    overTime: { idPersonApproveDoh: number; idPersonApproveLeaders: number; idsExtra: number[] };
  }) => Promise<ActionResponse<IConfigSystem>>;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TInputs>({
    defaultValues: {
      permissions_approvalDoh_idPerson: toNum(initialData.permissions?.approvalDoh?.idPerson),
      permissions_approvalLeaders_idPerson: toNum(initialData.permissions?.approvalLeaders?.idPerson),
      permissions_extra_ids: initialData.permissions?.extra?.ids ?? [],

      vacations_approvalDoh_idPerson: toNum(initialData.vacations?.approvalDoh?.idPerson),
      vacations_approvalLeaders_idPerson: toNum(initialData.vacations?.approvalLeaders?.idPerson),
      vacations_extra_ids: initialData.vacations?.extra?.ids ?? [],

      penalty_approvalDoh_idPerson: toNum(initialData.penaltyForUnjustifiedAbsence?.approvalDoh?.idPerson),
      penalty_approvalLeaders_idPerson: toNum(initialData.penaltyForUnjustifiedAbsence?.approvalLeaders?.idPerson),
      penalty_extra_ids: initialData.penaltyForUnjustifiedAbsence?.extra?.ids ?? [],

      overTime_approvalDoh_idPerson: toNum(initialData.overTime?.approvalDoh?.idPerson),
      overTime_approvalLeaders_idPerson: toNum(initialData.overTime?.approvalLeaders?.idPerson),
      overTime_extra_ids: initialData.overTime?.extra?.ids ?? [],
    },
  });

  useEffect(() => {
    reset({
      permissions_approvalDoh_idPerson: toNum(initialData.permissions?.approvalDoh?.idPerson),
      permissions_approvalLeaders_idPerson: toNum(initialData.permissions?.approvalLeaders?.idPerson),
      permissions_extra_ids: initialData.permissions?.extra?.ids ?? [],

      vacations_approvalDoh_idPerson: toNum(initialData.vacations?.approvalDoh?.idPerson),
      vacations_approvalLeaders_idPerson: toNum(initialData.vacations?.approvalLeaders?.idPerson),
      vacations_extra_ids: initialData.vacations?.extra?.ids ?? [],

      penalty_approvalDoh_idPerson: toNum(initialData.penaltyForUnjustifiedAbsence?.approvalDoh?.idPerson),
      penalty_approvalLeaders_idPerson: toNum(initialData.penaltyForUnjustifiedAbsence?.approvalLeaders?.idPerson),
      penalty_extra_ids: initialData.penaltyForUnjustifiedAbsence?.extra?.ids ?? [],

      overTime_approvalDoh_idPerson: toNum(initialData.overTime?.approvalDoh?.idPerson),
      overTime_approvalLeaders_idPerson: toNum(initialData.overTime?.approvalLeaders?.idPerson),
      overTime_extra_ids: initialData.overTime?.extra?.ids ?? [],
    });
  }, [initialData, reset]);

  const submit = async (formData: TInputs) => {
    const payload = {
      permissions: {
        idPersonApproveDoh: toNum(formData.permissions_approvalDoh_idPerson),
        idPersonApproveLeaders: toNum(formData.permissions_approvalLeaders_idPerson),
        idsExtra: formData.permissions_extra_ids ?? [],
      },
      vacations: {
        idPersonApproveDoh: toNum(formData.vacations_approvalDoh_idPerson),
        idPersonApproveLeaders: toNum(formData.vacations_approvalLeaders_idPerson),
        idsExtra: formData.vacations_extra_ids ?? [],
      },
      penaltyForUnjustifiedAbsence: {
        idPersonApproveDoh: toNum(formData.penalty_approvalDoh_idPerson),
        idPersonApproveLeaders: toNum(formData.penalty_approvalLeaders_idPerson),
        idsExtra: formData.penalty_extra_ids ?? [],
      },
      overTime: {
        idPersonApproveDoh: toNum(formData.overTime_approvalDoh_idPerson),
        idPersonApproveLeaders: toNum(formData.overTime_approvalLeaders_idPerson),
        idsExtra: formData.overTime_extra_ids ?? [],
      },
    };

    const res = await onSave(payload);
    if (!res.success) {
      alert(res.message ?? "No se pudo guardar");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Form onSubmit={handleSubmit(submit)}>
        <fieldset disabled={isSubmitting}>
          <Card.Body>
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <Card.Title className="mb-1">Actualizar configuración</Card.Title>
              </div>

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
                  Cancelar
                </Button>

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </div>

            <hr />

            <div className="row g-3">
              {/* PERMISOS */}
              <div className="col-12 col-md-6">
                <Card className="bg-body-tertiary border-0">
                  <Card.Body>
                    <h6 className="mb-3">Permisos</h6>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión DOH</Form.Label>
                      <EmployeeField
                        control={control}
                        name="permissions_approvalDoh_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.permissions?.approvalDoh?.employee)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres</Form.Label>
                      <EmployeeField
                        control={control}
                        name="permissions_approvalLeaders_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.permissions?.approvalLeaders?.employee)}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres Extras</Form.Label>
                      <EmployeeExtraField control={control} name="permissions_extra_ids" />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </div>

              {/* VACACIONES */}
              <div className="col-12 col-md-6">
                <Card className="bg-body-tertiary border-0">
                  <Card.Body>
                    <h6 className="mb-3">Vacaciones</h6>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión DOH</Form.Label>
                      <EmployeeField
                        control={control}
                        name="vacations_approvalDoh_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.vacations?.approvalDoh?.employee)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres</Form.Label>
                      <EmployeeField
                        control={control}
                        name="vacations_approvalLeaders_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.vacations?.approvalLeaders?.employee)}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres Extras</Form.Label>
                      <EmployeeExtraField control={control} name="vacations_extra_ids" />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </div>

              {/* FALTA INJUSTIFICADA */}
              <div className="col-12 col-md-6">
                <Card className="bg-body-tertiary border-0">
                  <Card.Body>
                    <h6 className="mb-3">Falta injustificada</h6>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión DOH</Form.Label>
                      <EmployeeField
                        control={control}
                        name="penalty_approvalDoh_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.penaltyForUnjustifiedAbsence?.approvalDoh?.employee)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres</Form.Label>
                      <EmployeeField
                        control={control}
                        name="penalty_approvalLeaders_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.penaltyForUnjustifiedAbsence?.approvalLeaders?.employee)}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres Extras</Form.Label>
                      <EmployeeExtraField control={control} name="penalty_extra_ids" />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </div>

              {/* HORAS EXTRA */}
              <div className="col-12 col-md-6">
                <Card className="bg-body-tertiary border-0">
                  <Card.Body>
                    <h6 className="mb-3">Horas extra</h6>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión DOH</Form.Label>
                      <EmployeeField
                        control={control}
                        name="overTime_approvalDoh_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.overTime?.approvalDoh?.employee)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres</Form.Label>
                      <EmployeeField
                        control={control}
                        name="overTime_approvalLeaders_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.overTime?.approvalLeaders?.employee)}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="small text-muted">Revisión Dirección A Lideres Extras</Form.Label>
                      <EmployeeExtraField control={control} name="overTime_extra_ids" />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Card.Body>
        </fieldset>
      </Form>
    </Card>
  );
}
