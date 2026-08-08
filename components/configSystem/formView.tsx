"use client";

import { IConfigSystem } from "@/app/actions/configSystem-actions";
import { Button, Card } from "react-bootstrap";

type Employee = {
  name: string;
  lastName: string
};

const upperCase = (text?: string) => {
  return text?.toUpperCase() || "";
};

function fullName(emp?: Employee) {
  if (!emp) return "-";
  return `${upperCase(emp.lastName ?? "")} ${upperCase(emp.name ?? "")}`.trim();
}

function BlockView({
  title,
  doh,
  extras }: {
    title: string;
    doh?: { employee?: { name: string; lastName: string } };
    leaders?: { employee?: { name: string; lastName: string } };
    management?: { employee?: { name: string; lastName: string } };
    extras?: { employees?: { name: string; lastName: string }[] };

  }) {

  return (
    <Card className="border shadow-sm rounded-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 fw-bold">{title}</h6>

          <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
            Revisiones
          </span>
        </div>

        <div className="d-flex flex-column gap-3">

          <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-check text-success" />
              <span className="text-muted">Revisión DOH</span>
            </div>

            <span className="fw-semibold me-5">
              {fullName(doh?.employee)}
            </span>
          </div>

          {/* <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-diagram-3 text-primary" />
              <span className="text-muted">
                Revisión Dirección a Líderes
              </span>
            </div>

            <span className="fw-semibold">
              {fullName(leaders?.employee)}
            </span>
          </div> */}

          {/* <ConditionalRender cond={!!management}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-building text-warning" />
                <span className="text-muted">Dirección</span>
              </div>

              <span className="fw-semibold">
                {fullName(management?.employee)}
              </span>
            </div>
          </ConditionalRender> */}

          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-building text-warning" />
              <span className="text-muted">Dirección</span>
            </div>

            <div className="d-flex flex-column gap-1">
              {extras?.employees?.map((el: Employee, index: number) => (
                <div key={index} className="d-flex align-items-center gap-1 fw-semibold text-left">
                  <i className="bi bi bi-check2 me-1" style={{ fontSize: "0.5rem" }} />
                  <span>{`${upperCase(el.lastName ?? "")} ${upperCase(el.name ?? "")}`.trim()}</span>
                </div>
              ))}
            </div>
          </div>

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
    //Bloque para bloquear pagina y mostrar mensaje cargando
    <>
    

      <Card className="border-0 shadow-sm">

        <Card.Body>
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              <Card.Title className="mb-1 fs-2">Configuración del sistema</Card.Title>
            </div>

            <Button
              variant="success"
              onClick={onEdit}
              disabled={isLoading}>
              Actualizar
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

            <div className="col-12 col-md-6">
              <BlockView
                title="Constancias"
                doh={data.constancy?.approvalDoh}
                leaders={data.constancy?.approvalLeaders}
                extras={data.constancy?.extra}
              />
            </div>

            <div className="col-12 col-md-6">
              <BlockView
                title="Penalizaciones"
                doh={data.penalties?.approvalDoh}
                leaders={data.penalties?.approvalLeaders}
                management={data.penalties?.approvalManager}
                extras={data.constancy?.extra}
              />
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

