"use client";

import { ActionResponse, Branch } from "@/lib/definitions";
import { useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import ModalBlur from "../ModalBlur";
import FormUpdateBranch from "./FormUpdateBranch";
import toast from "react-hot-toast";
import { deleteBranch, updateBranch } from "@/app/actions/branches-actionst";
import { useModals } from "@/context/ModalContext";

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

export default function BrancheOne({
  branch,
}: {
  branch: Branch | null;
}) {
    const [showUpdateBranchModal, setShowUpdateBranchModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm  } = useModals();

    const router = useRouter();
  if (!branch) {
    return (
      <div className="py-4">
        <h4 className="mb-0">Sucursal no encontrada</h4>
      </div>
    );
  }

  const handleUpdateBranch = async (
    data: Branch
  ): Promise<ActionResponse<boolean | null>> => {
    if (!branch?.id) {
      return {
        success: false,
        message: "No se encontró la sucursal",
        data: null,
      };
    }
  
    const res = await updateBranch({
      id: Number(branch.id),
      branch: data,
    });
  
    if (!res.success) {
      modalError(res.message);
      return {
        success: false,
        message: res.message,
        data: null,
      };
    }
  
    toast.success(res.message);
  
    return {
      success: true,
      message: res.message,
      data: true,
    };
  };

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading('Cargando...');
    router.push("/app/branches/create");
  };

  const handleDeleteBranch = async () => {
    if (!branch?.id) {
      modalError("No se encontró la sucursal");
      return;
    }
  
    modalConfirm("¿Deseas eliminar esta sucursal?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Eliminando sucursal...");
  
        const res = await deleteBranch({ id: Number(branch.id) });
  
        if (!res.success) {
          modalError(res.message);
          return;
        }
  
        toast.success(res.message);
        router.push("/app/branches");
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
        <ConditionalRender cond={loading}>
            <Loading message={messageLoading} />
        </ConditionalRender>

        <div className="d-flex flex-wrap align-items-center gap-2 my-2">
            <Button
                size="sm"
                variant="primary"
                className="fw-semibold d-inline-flex align-items-center gap-2"
                onClick={handleCreate}
                disabled={loading}
            >
                <i className="bi bi-plus-lg" />
                Crear Sucursal
            </Button>

            <Button
                size="sm"
                variant="primary"
                onClick={() => setShowUpdateBranchModal(true)}
                disabled={loading}
            >
                <i className="bi bi-pencil me-2" />
                Actualizar Sucursal
            </Button>

            <Button
                size="sm"
                variant="danger"
                onClick={handleDeleteBranch}
                disabled={loading}
            >
                <i className="bi bi-trash me-2" />
                Eliminar Sucursal
            </Button>
        </div>
        <div className="mb-4">
            <h1 className="mb-0 text-white">{branch.name}</h1>
        </div>

        <div className="d-grid gap-4">
            <section>
            <h5 className="mb-3 text-uppercase">Información general</h5>
            <div className="row g-4">
                <div className="col-12 col-md-6">
                <InfoItem label="Nombre:" value={formatText(branch.name)} />
                </div>
                <div className="col-12 col-md-6">
                <InfoItem
                    label="ID Manager:"
                    value={formatText(branch.idManager)}
                    uppercase={false}
                />
                </div>
            </div>
            </section>

            <section>
            <h5 className="mb-3 text-uppercase">Dirección</h5>
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                <InfoItem
                    label="Calle:"
                    value={formatText(branch.address?.street)}
                />
                </div>

                <div className="col-12 col-md-4 col-lg-2">
                <InfoItem
                    label="No. Exterior:"
                    value={formatText(branch.address?.numberOut)}
                    uppercase={false}
                />
                </div>

                <div className="col-12 col-md-4 col-lg-2">
                <InfoItem
                    label="No. Interior:"
                    value={formatText(branch.address?.numberIn)}
                    uppercase={false}
                />
                </div>

                <div className="col-12 col-md-4 col-lg-2">
                <InfoItem
                    label="C.P.:"
                    value={formatText(branch.address?.zipCode)}
                    uppercase={false}
                />
                </div>

                <div className="col-12 col-md-6">
                <InfoItem
                    label="Colonia:"
                    value={formatText(branch.address?.neighborhood)}
                />
                </div>

                <div className="col-12 col-md-6">
                <InfoItem
                    label="Municipio:"
                    value={formatText(branch.address?.municipality)}
                />
                </div>

                <div className="col-12 col-md-6">
                <InfoItem
                    label="Estado:"
                    value={formatText(branch.address?.state)}
                />
                </div>

                <div className="col-12 col-md-6">
                <InfoItem
                    label="País:"
                    value={formatText(branch.address?.country)}
                />
                </div>
            </div>
            </section>

            <section>
            <h5 className="mb-3 text-uppercase">Coordenadas</h5>
            <div className="row g-4">
                <div className="col-12 col-md-6">
                <InfoItem
                    label="Latitud:"
                    value={formatText(branch.address?.coordinates?.lat)}
                    uppercase={false}
                />
                </div>

                <div className="col-12 col-md-6">
                <InfoItem
                    label="Longitud:"
                    value={formatText(branch.address?.coordinates?.lng)}
                    uppercase={false}
                />
                </div>
            </div>
            </section>
        </div>

      {showUpdateBranchModal && (
        <ModalBlur onClose={() => setShowUpdateBranchModal(false)}>
          <FormUpdateBranch
            show={showUpdateBranchModal}
            onHide={() => setShowUpdateBranchModal(false)}
            sendData={handleUpdateBranch}
            branch={branch}
          />
        </ModalBlur>
      )}
    </>
  );
}