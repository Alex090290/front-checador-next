"use client";

import { IConfigSystem } from "@/app/actions/configSystem-actions";
import { Button, Card } from "react-bootstrap";

function fullName(emp?: { name: string; lastName: string }) {
  if (!emp) return "-";
  return `${emp.name ?? ""} ${emp.lastName ?? ""}`.trim();
}

function fullNames(list?: { name: string; lastName: string }[]) {
  if (!list || list.length === 0) return "-";
  return list.map(fullName).filter(Boolean).join(", ");
}

function BlockView({
  title,
  doh,
  leaders,
  extras,
}: {
  title: string;
  doh?: { employee?: { name: string; lastName: string } };
  leaders?: { employee?: { name: string; lastName: string } };
  extras?: { employees?: { name: string; lastName: string }[] };
}) {
  return (
    <Card className="bg-body-tertiary border-0">
      <Card.Body>
        <h6 className="mb-3">{title}</h6>

        <div className="d-flex justify-content-between">
          <span className="text-muted">Revisión DOH</span>
          <span className="fw-semibold">{fullName(doh?.employee)}</span>
        </div>

        <div className="d-flex justify-content-between mt-2">
          <span className="text-muted">Revisión Dirección A Lideres</span>
          <span className="fw-semibold">{fullName(leaders?.employee)}</span>
        </div>

        <div className="d-flex justify-content-between mt-2">
          <span className="text-muted">Revisión Dirección A Lideres Extras</span>
          <span className="fw-semibold text-end" style={{ maxWidth: 280 }}>
            {fullNames(extras?.employees)}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function ConfigSystemView({
  data,
  onEdit,
  isLoading = false,
}: {
  data: IConfigSystem;
  onEdit: () => void;
  isLoading?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <Card.Title className="mb-1">Configuración del sistema</Card.Title>
          </div>

          <Button variant="primary" onClick={onEdit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Cargando...
              </>
            ) : (
              "Actualizar"
            )}
          </Button>
        </div>

        <hr />

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <BlockView
              title="Permisos"
              doh={data.permissions?.approvalDoh}
              leaders={data.permissions?.approvalLeaders}
              extras={data.permissions?.extra}
            />
          </div>

          <div className="col-12 col-md-6">
            <BlockView
              title="Vacaciones"
              doh={data.vacations?.approvalDoh}
              leaders={data.vacations?.approvalLeaders}
              extras={data.vacations?.extra}
            />
          </div>

          <div className="col-12 col-md-6">
            <BlockView
              title="Falta injustificada"
              doh={data.penaltyForUnjustifiedAbsence?.approvalDoh}
              leaders={data.penaltyForUnjustifiedAbsence?.approvalLeaders}
              extras={data.penaltyForUnjustifiedAbsence?.extra}
            />
          </div>

          <div className="col-12 col-md-6">
            <BlockView
              title="Horas extra"
              doh={data.overTime?.approvalDoh}
              leaders={data.overTime?.approvalLeaders}
              extras={data.overTime?.extra}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
