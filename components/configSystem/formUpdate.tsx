"use client";

import { IConfigSystem } from "@/app/actions/configSystem-actions";
import { ActionResponse } from "@/lib/definitions";
import { Button, Card, Form } from "react-bootstrap";
import { Control, Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";

type TInputs = {
  permissions_approvalDoh_idPerson: number;
  permissions_approvalLeaders_idPerson: number;
  vacations_approvalDoh_idPerson: number;
  vacations_approvalLeaders_idPerson: number;
};

const toNum = (v: unknown, fallback = 0) => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

type Employee = {
  _id: string;
  id: number;
  name: string;
  lastName: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const empName = (e: Employee) => `${e.name ?? ""} ${e.lastName ?? ""}`.trim();

const fullNameFromConfig = (emp?: { name: string; lastName: string }) => {
  if (!emp) return "";
  return `${emp.name ?? ""} ${emp.lastName ?? ""}`.trim();
};

function EmployeeAutocomplete({
  employees,
  value,
  onChange,
  onTouched,
  placeholder,
  initialLabel,
  isEmployeesLoading,
}: {
  employees: Employee[];
  value: number;
  onChange: (val: number) => void;
  onTouched?: () => void;
  placeholder?: string;
  initialLabel?: string;
  isEmployeesLoading?: boolean; // ✅ nuevo
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
        const id = String(e.id);
        return name.includes(term) || id.includes(term);
      })
      .slice(0, 15);
  }, [employees, q]);

  const commitSelection = (e: Employee) => {
    const id = Number(e.id);

    pendingClearRef.current = false;
    onChange(id);
    onTouched?.();

    setQ(`${empName(e)} (${id})`);
    setOpen(false);
    userTypingRef.current = false;
  };

  return (
    <div ref={ref} className="position-relative">
      <Form.Control
        value={q}
        placeholder={isEmployeesLoading ? "Cargando empleados..." : placeholder ?? "Buscar empleado..."}
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

          if (next.trim() === "") pendingClearRef.current = true;
          else pendingClearRef.current = false;
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
                key={emp._id ?? emp.id}
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
    | "vacations_approvalLeaders_idPerson";
  placeholder?: string;
  initialLabel?: string;
}) {
  const { data, isLoading } = useSWR("/api/employees", fetcher);
  const employees: Employee[] = data?.data ?? [];

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

export default function ConfigSystemUpdate({
  initialData,
  onCancel,
  onSave,
}: {
  initialData: IConfigSystem;
  onCancel: () => void;
  onSave: (payload: {
    permissions: { idPersonApproveDoh: number; idPersonApproveLeaders: number };
    vacations: { idPersonApproveDoh: number; idPersonApproveLeaders: number };
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
      vacations_approvalDoh_idPerson: toNum(initialData.vacations?.approvalDoh?.idPerson),
      vacations_approvalLeaders_idPerson: toNum(initialData.vacations?.approvalLeaders?.idPerson),
    },
  });

  useEffect(() => {
    reset({
      permissions_approvalDoh_idPerson: toNum(initialData.permissions?.approvalDoh?.idPerson),
      permissions_approvalLeaders_idPerson: toNum(initialData.permissions?.approvalLeaders?.idPerson),
      vacations_approvalDoh_idPerson: toNum(initialData.vacations?.approvalDoh?.idPerson),
      vacations_approvalLeaders_idPerson: toNum(initialData.vacations?.approvalLeaders?.idPerson),
    });
  }, [initialData, reset]);

  const submit = async (formData: TInputs) => {
    const payload = {
      permissions: {
        idPersonApproveDoh: toNum(formData.permissions_approvalDoh_idPerson),
        idPersonApproveLeaders: toNum(formData.permissions_approvalLeaders_idPerson),
      },
      vacations: {
        idPersonApproveDoh: toNum(formData.vacations_approvalDoh_idPerson),
        idPersonApproveLeaders: toNum(formData.vacations_approvalLeaders_idPerson),
      },
    };

    const res = await onSave(payload);
    if (!res.success) {
      alert(res.message ?? "No se pudo guardar");
      return;
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
              <div className="col-12 col-md-6">
                <Card className="bg-body-tertiary border-0">
                  <Card.Body>
                    <h6 className="mb-3">Permisos</h6>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Aprovador DOH</Form.Label>
                      <EmployeeField
                        control={control}
                        name="permissions_approvalDoh_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.permissions?.approvalDoh?.employee)}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="small text-muted">Aprovador de lideres</Form.Label>
                      <EmployeeField
                        control={control}
                        name="permissions_approvalLeaders_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.permissions?.approvalLeaders?.employee)}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-12 col-md-6">
                <Card className="bg-body-tertiary border-0">
                  <Card.Body>
                    <h6 className="mb-3">Vacations</h6>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Aprovador DOH</Form.Label>
                      <EmployeeField
                        control={control}
                        name="vacations_approvalDoh_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.vacations?.approvalDoh?.employee)}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="small text-muted">Aprovador de lideres</Form.Label>
                      <EmployeeField
                        control={control}
                        name="vacations_approvalLeaders_idPerson"
                        placeholder="Buscar empleado..."
                        initialLabel={fullNameFromConfig(initialData.vacations?.approvalLeaders?.employee)}
                      />
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
