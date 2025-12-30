"use client";

import { IConfigSystem } from "@/app/actions/configSystem-actions";
import { Button, Card } from "react-bootstrap";

function fullName(emp?: { name: string; lastName: string }) {
  if (!emp) return "-";
  return `${emp.name ?? ""} ${emp.lastName ?? ""}`.trim();
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
  const pDoh = data.permissions?.approvalDoh;
  const pLea = data.permissions?.approvalLeaders;

  const vDoh = data.vacations?.approvalDoh;
  const vLea = data.vacations?.approvalLeaders;

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
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
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
            <Card className="bg-body-tertiary border-0">
              <Card.Body>
                <h6 className="mb-3">Permisos</h6>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Aprovador de DOH</span>
                  <span className="fw-semibold">{fullName(pDoh?.employee)}</span>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span className="text-muted">Aprovador de lideres</span>
                  <span className="fw-semibold">{fullName(pLea?.employee)}</span>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-12 col-md-6">
            <Card className="bg-body-tertiary border-0">
              <Card.Body>
                <h6 className="mb-3">Vacaciones</h6>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Aprovador de DOH</span>
                  <span className="fw-semibold">{fullName(vDoh?.employee)}</span>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span className="text-muted">Aprovador de lideres</span>
                  <span className="fw-semibold">{fullName(vLea?.employee)}</span>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
