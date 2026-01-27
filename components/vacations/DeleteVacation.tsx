"use client";

import { deleteVacation } from "@/app/actions/vacations-actions";
import { useModals } from "@/context/ModalContext";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "react-bootstrap";

export default function DeleteleVacation({
  idRequest,
  idPeriod,
}: {
  idRequest: number;
  idPeriod: number;
}) {
  const session = useSessionSnapshot();
  const { modalError, modalConfirm } = useModals();
  const router = useRouter();
  const sp = useSearchParams();

  const permissionDelete =
    session?.uid?.permissions?.some(
      (f: { text?: string }) => f.text === "eliminar_solicitudes_de_vacaciones"
    ) ?? false;

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("view_type", "list");
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(20));

    router.push(`/app/vacationList?${params.toString()}`);
    router.refresh(); 
  };

  const deletePuesto = async () => {
    const res = await deleteVacation(idRequest, idPeriod);
    if (!res.success) {
      modalError(res.message);
      return;
    }
    goToPage(1);
  };

  const handleDeletePuesto = () => {
    modalConfirm("¿Seguro que desea eliminar este registro?", () =>
      deletePuesto()
    );
  };

  if (!permissionDelete) return null;

  return (
        <Button
            variant="outline-danger"
            size="sm"
            className="d-inline-flex align-items-center gap-2"
            onClick={handleDeletePuesto}
            >
            <i className="bi bi-trash" />
            Eliminar
        </Button>
  );
}
