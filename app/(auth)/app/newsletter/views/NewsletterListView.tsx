"use client";

import { deleteNotice } from "@/app/actions/newsletter-actions";
import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { useModals } from "@/context/ModalContext";
import { Newsletter } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";

function NewsletterListView({ newsletters }: { newsletters: Newsletter[] }) {
  const { modalError, modalConfirm } = useModals();

  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  const colums: TableTemplateColumn<Newsletter>[] = [
    {
      key: "title",
      label: "Título",
      accessor: (row) => row.title,
      type: "string",
      filterable: true,
    },
    {
      key: "text",
      label: "Texto",
      accessor: (row) => row.text,
      type: "string",
    },
    {
      key: "dateInitiPublish",
      label: "Inicio",
      accessor: (row) => row.dateInitiPublish,
      type: "date",
      groupFormat: "yyyy-MM",
      render: (row) => (
        <div className="text-end">
          {row.dateInitiPublish
            ? formatDate(row.dateInitiPublish, "dd-MM-yyyy HH:mm")
            : null}
        </div>
      ),
    },
    {
      key: "dateEndPublish",
      label: "Final",
      accessor: (row) => row.dateEndPublish,
      type: "date",
      groupFormat: "yyyy-MM",
      render: (row) => (
        <div className="text-end">
          {row.dateEndPublish
            ? formatDate(row.dateEndPublish, "dd-MM-yyyy HH:mm")
            : null}
        </div>
      ),
    },
  ];

  const actionDeleteRecord = () => {
    if (selectedIds.length <= 0)
      return modalError("Selecciona un registro para continuar");

    modalConfirm(
      `Se eliminarán ${
        selectedIds.length ?? 0
      }\nConfirma la acción para continuar`,
      async () => {
        const toastId = toast.loading("Eliminando registros");
        for (const record of selectedIds) {
          const res = await deleteNotice({ id: String(record) });
          if (!res) return modalError("Error al eliminar registro");
        }
        toast.success("Se han eliminado los registros", { id: toastId });
      }
    );
  };

  return (
    <ListView>
      <ListView.Header
        title={`Anuncios (${newsletters.length ?? 0})`}
        formView="/app/newsletter?view_type=form&id=null"
        actions={[
          {
            action: actionDeleteRecord,
            string: (
              <>
                <i className="bi bi-trash me-2"></i>
                <span>Eliminar</span>
              </>
            ),
          },
        ]}
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          columns={colums}
          data={newsletters}
          getRowId={(row) => row.id}
          viewForm="/app/newsletter?view_type=form"
          onSelectionChange={setSelectedIds}
        />
      </ListView.Body>
    </ListView>
  );
}

export default NewsletterListView;
