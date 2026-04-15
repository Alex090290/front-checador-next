"use client";

import { deleteDepartment, updateDepartment } from "@/app/actions/departments-actions";
import { ActionResponse, Department, Employee } from "@/lib/definitions";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useModals } from "@/context/ModalContext";
import ModalBlur from "../ModalBlur";
import toast from "react-hot-toast";
import FormUpdateDepartment from "./UpdateDepartment";

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

export default function InfoOneDepartment({
  department,
  employees = [],
}: {
  department: Department | null;
  employees?: Employee[];
}) {
  const [showUpdateDepartmentModal, setShowUpdateDepartmentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  if (!department) {
    return (
      <div className="py-4">
        <h4 className="mb-0">Departamento no encontrado</h4>
      </div>
    );
  }
  
  const leader =
    employees.find((emp) => emp.id === department.idLeader) || department.leader;

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/departments/create");
  };

  const handleUpdateDepartment = async (
    data: Department
  ): Promise<ActionResponse<boolean | null>> => {
    if (!department?.id) {
      return {
        success: false,
        message: "No se encontró el departamento",
        data: null,
      };
    }

    const res = await updateDepartment({
      id: Number(department.id),
      data,
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

  const handleDeleteDepartment = async () => {
    if (!department?.id) {
      modalError("No se encontró el departamento");
      return;
    }

    modalConfirm("¿Deseas eliminar este departamento?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Eliminando departamento...");

        const res = await deleteDepartment({ id: Number(department.id) });

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        router.push("/app/departments");
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
          Crear Departamento
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowUpdateDepartmentModal(true)}
          disabled={loading}
        >
          <i className="bi bi-pencil me-2" />
          Actualizar Departamento
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={handleDeleteDepartment}
          disabled={loading}
        >
          <i className="bi bi-trash me-2" />
          Eliminar Departamento
        </Button>
      </div>

      <div className="mb-4">
        <h1 className="mb-0 text-white">{department.nameDepartment}</h1>
      </div>

      <div className="d-grid gap-4">
        <section>
          <h5 className="mb-3 text-uppercase">Información general</h5>
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <InfoItem
                label="Nombre:"
                value={formatText(department.nameDepartment)}
              />
            </div>

            <div className="col-12 col-md-6">
              <InfoItem
                label="Líder:"
                value={
                  leader
                    ? `${leader.name} ${leader.lastName ?? ""}`.trim()
                    : "-"
                }
              />
            </div>

            <div className="col-12">
              <InfoItem
                label="Descripción:"
                value={formatText(department.description)}
                uppercase={false}
              />
            </div>
          </div>
        </section>

        <section>
          <h5 className="mb-3 text-uppercase">Puestos</h5>

          {department.positions?.length ? (
            <div className="row g-3">
              {department.positions.map((puesto) => (
                <div
                  key={puesto._id || puesto.id || puesto.namePosition}
                  className="col-12 col-md-6 col-lg-4"
                >
                  <div className="rounded border p-3 h-100 bg-body-tertiary">
                    <div className="fw-semibold text-uppercase">
                      {formatText(puesto.namePosition)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted">Sin puestos registrados</div>
          )}
        </section>
      </div>

      {showUpdateDepartmentModal && (
        <ModalBlur onClose={() => setShowUpdateDepartmentModal(false)}>
          <FormUpdateDepartment
            show={showUpdateDepartmentModal}
            onHide={() => setShowUpdateDepartmentModal(false)}
            sendData={handleUpdateDepartment}
            department={department}
            employees={employees}
          />
        </ModalBlur>
      )}
    </>
  );
}