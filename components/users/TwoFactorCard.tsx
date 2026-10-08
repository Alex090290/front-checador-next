"use client";

import { useState } from "react";
import { Button, Card } from "react-bootstrap";
import ModalBlur from "@/components/ModalBlur";
import ConditionalRender from "@/components/ConditionalRender";
import TwoFactorSetupModal from "./TwoFactorSetupModal";
import TwoFactorDisableModal from "./TwoFactorDisableModal";

// Tarjeta de verificación en dos pasos compartida por el perfil de usuario y el de empleado.
// Las actions de 2FA usan el token de la sesión, así que funciona igual para ambos.
export default function TwoFactorCard({
  twoFactorEnabled,
}: {
  twoFactorEnabled: boolean;
}) {
  const [showTwoFactorSetupModal, setShowTwoFactorSetupModal] = useState(false);
  const [showTwoFactorDisableModal, setShowTwoFactorDisableModal] = useState(false);

  return (
    <>
      <Card className="border rounded-4 h-100">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h6 className="mb-0 fw-bold">Verificación en dos pasos</h6>

            <span
              className={`badge rounded-pill px3 py-2 fw-semibold border ${twoFactorEnabled
                ? "bg-success-subtle text-success-emphasis border-success-subtle"
                : "bg-secondary-subtle text-secondary-emphasis border-secondary-subtle"
                }`}
            >
              {twoFactorEnabled ? "Activa" : "Inactiva"}
            </span>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2 text-muted">
              <i className="bi bi-shield-lock text-primary" />
              <span>
                {twoFactorEnabled
                  ? "Al iniciar sesión se te pedirá el código de Google Authenticator."
                  : "Agrega un código de Google Authenticator al iniciar sesión."}
              </span>
            </div>

            <ConditionalRender cond={!twoFactorEnabled}>
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-3"
                variant="primary"
                onClick={() => setShowTwoFactorSetupModal(true)}
              >
                <i className="bi bi-shield-check me-2" />
                Activar verificación en dos pasos
              </Button>
            </ConditionalRender>

            <ConditionalRender cond={twoFactorEnabled}>
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-3"
                variant="outline-danger"
                onClick={() => setShowTwoFactorDisableModal(true)}
              >
                <i className="bi bi-shield-x me-2" />
                Desactivar verificación en dos pasos
              </Button>
            </ConditionalRender>
          </div>
        </Card.Body>
      </Card>

      <ConditionalRender cond={showTwoFactorSetupModal}>
        <ModalBlur onClose={() => setShowTwoFactorSetupModal(false)}>
          <TwoFactorSetupModal
            show={showTwoFactorSetupModal}
            onHide={() => setShowTwoFactorSetupModal(false)}
          />
        </ModalBlur>
      </ConditionalRender>

      <ConditionalRender cond={showTwoFactorDisableModal}>
        <ModalBlur onClose={() => setShowTwoFactorDisableModal(false)}>
          <TwoFactorDisableModal
            show={showTwoFactorDisableModal}
            onHide={() => setShowTwoFactorDisableModal(false)}
          />
        </ModalBlur>
      </ConditionalRender>
    </>
  );
}
