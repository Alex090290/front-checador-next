"use client";

import { useState } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import ModalBlur from "@/components/ModalBlur";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { updateUser } from "@/app/actions/user-actions";
import { User } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import FormUpdateProfile from "./UpdateProfile";
import ChangePasswordModal from "@/app/(auth)/app/users/views/ModalChangePassword";

type TInputsProfile = {
  name: string;
  lastName: string;
  email: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  phone: PhoneNumberFormat | string | null;
  imageUrl?: string | null;
};

function formatText(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
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

export default function UserProfileView({
  user,
}: {
  user: User | null;
}) {
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [loading] = useState(false);
  const [messageLoading] = useState("");

  const { modalError } = useModals();

  if (!user) {
    return (
      <div className="py-4">
        <h4 className="mb-0">Perfil no encontrado</h4>
      </div>
    );
  }

  const handleUpdateProfile = async (
    data: TInputsProfile
  ): Promise<{ success: boolean; message: string; data: boolean | null }> => {
    const res = await updateUser({
      ...data,
      id: user.id,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      idEmployee: user.idEmployee || null,
    });

    if (!res) {
      return {
        success: false,
        message: "No se pudo actualizar el perfil",
        data: null,
      };
    }

    toast.success("Perfil actualizado correctamente");

    return {
      success: true,
      message: "Perfil actualizado correctamente",
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
          {`${user.name || ""} ${user.lastName || ""}`.trim() || "Mi Perfil"}
        </h1>
      </div>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowUpdateProfileModal(true)}
        >
          <i className="bi bi-pencil me-2" />
          Actualizar perfil
        </Button>

        <Button
          size="sm"
          variant="info"
          onClick={() => setShowChangePasswordModal(true)}
        >
          <i className="bi bi-key me-2" />
          Cambiar contraseña
        </Button>
      </div>

      <div className="d-grid gap-4">
        <section>
          <h5 className="mb-3 text-uppercase">Datos personales</h5>
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <InfoItem label="Nombre:" value={formatText(user.name)} />
            </div>

            <div className="col-12 col-md-6">
              <InfoItem label="Apellidos:" value={formatText(user.lastName)} />
            </div>

            <div className="col-12 col-md-6">
              <InfoItem
                label="Teléfono:"
                value={formatText(user.phone?.internationalNumber)}
                uppercase={false}
              />
            </div>

            <div className="col-12 col-md-6">
              <InfoItem label="Género:" value={formatText(user.gender)} />
            </div>
          </div>
        </section>

        <section>
          <h5 className="mb-3 text-uppercase">Cuenta</h5>
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <InfoItem
                label="Correo:"
                value={formatText(user.email)}
                uppercase={false}
              />
            </div>

            <div className="col-12 col-md-6">
              <InfoItem label="Rol:" value={formatText(user.role)} />
            </div>

            <div className="col-12 col-md-6">
              <InfoItem
                label="Estatus:"
                value={
                  user.status === 1
                    ? "Activo"
                    : user.status === 2
                    ? "Suspendido"
                    : user.status === 3
                    ? "Eliminado"
                    : "-"
                }
              />
            </div>

            <div className="col-12 col-md-6">
              <InfoItem
                label="ID Empleado relacionado:"
                value={formatText(user.idEmployee)}
                uppercase={false}
              />
            </div>
          </div>
        </section>
      </div>

      {showUpdateProfileModal && (
        <ModalBlur onClose={() => setShowUpdateProfileModal(false)}>
          <FormUpdateProfile
            show={showUpdateProfileModal}
            onHide={() => setShowUpdateProfileModal(false)}
            sendData={handleUpdateProfile}
            user={user}
          />
        </ModalBlur>
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal
          show={showChangePasswordModal}
          userId={Number.isFinite(Number(user.id)) ? Number(user.id) : null}
          onHide={() => setShowChangePasswordModal(false)}
        />
      )}
    </>
  );
}