"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { useModals } from "@/context/ModalContext";
import { ActionResponse, Employee, ICheckInFeedback } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useState } from "react";
import ModifyModalForm from "./ModifyModalForm";
import { updateRegristrosChecador } from "@/app/actions/eventos-actions";

function EventosListView({ eventos }: { eventos: ICheckInFeedback[] }) {
  const { modalError } = useModals();
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [modalModify, setModalModify] = useState<{
    show: boolean;
    type: string;
    status: string;
  }>({ show: false, type: "", status: "" });

  const getSechedule = (type: string, schedules: Employee) => {
    let string: string = "";

    switch (type) {
      case "entrada_oficina":
        string = `${schedules.scheduleOffice?.entry || " "} - ${
          schedules.scheduleOffice?.exit || " "
        }`;
        break;
      case "salida_oficina":
        string = `${schedules.scheduleOffice?.entry || " "} - ${
          schedules.scheduleOffice?.exit || " "
        }`;
        break;
      case "sale_a_comer":
        string = `${schedules.scheduleLunch?.entry || " "} - ${
          schedules.scheduleLunch?.exit || " "
        }`;
        break;
      case "regresa_de_comer":
        string = `${schedules.scheduleLunch?.entry || " "} - ${
          schedules.scheduleLunch?.exit || " "
        }`;
        break;
      case "entrada_sabado":
        string = `${schedules.scheduleSaturday?.entry || " "} - ${
          schedules.scheduleSaturday?.exit
        }`;
        break;
      case "salida_sabado":
        string = `${schedules.scheduleSaturday?.entry || " "} - ${
          schedules.scheduleSaturday?.exit
        }`;
        break;
      default:
        string = "sin definir";
        break;
    }

    return string;
  };
  const columns: TableTemplateColumn<ICheckInFeedback>[] = [
    {
      key: "employee",
      label: "Empleado",
      accessor: (row) => row.employee.name,
      filterable: true,
      render: (row) => (
        <div className="text-uppercase">{row.employee.name}</div>
      ),
    },
    {
      key: "type",
      label: "Evento",
      filterable: true,
      accessor: (row) => row.checks.type.replace(/_/g, " ").toUpperCase(),
      render: (row) => (
        <div
          className={`rounded text-center fw-semibold ${
            row.checks.type === "no_clasificado" ? "bg-warning" : "bg-success"
          }`}
        >
          {row.checks.type.replace(/_/g, " ").toUpperCase()}
        </div>
      ),
    },
    {
      key: "timestamp",
      label: "Fecha",
      accessor: (row) => row.checks.timestamp,
      filterable: false,
      render: (row) => (
        <div className="text-center fw-semibold">
          {formatDate(row.checks.timestamp, "dd/MM/yyyy HH:mm")}
        </div>
      ),
      type: "date",
      groupFormat: "dd/MM/yyyy",
    },
    {
      key: "differences",
      label: "Diferencia",
      accessor: (row) => row.checks.minutesDifference,
      render: (row) => (
        <div className=" text-center fw-semibold">
          {row.checks.minutesDifference}
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Horario",
      accessor: (row) => row.employee.scheduleDescription,
      render: (row) => (
        <div className="text-center fw-semibold text-uppercase">
          {getSechedule(row.checks.type, row.employee)}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) =>
        row.checks.status
          ? row.checks.status.replace(/_/g, " ").toUpperCase()
          : null,
      render: (row) => {
        const status = row.checks.status?.toLowerCase();

        const bgClass =
          status === "desconocido"
            ? "bg-warning"
            : status === "retardo"
            ? "bg-danger text-white"
            : "";

        return (
          <div
            className={`text-uppercase text-center rounded fw-semibold ${bgClass}`}
          >
            {status?.replace(/_/g, " ").toUpperCase()}
          </div>
        );
      },
    },
    {
      key: "user",
      label: "Checador",
      accessor: (row) => `${row.user.name} ${row.user.lastName}`,
      render: (row) => (
        <div className="text-uppercase">{`${row.user.name} ${row.user.lastName}`}</div>
      ),
    },
    {
      key: "position",
      label: "Puesto",
      accessor: (row) => row.positionEmployee.namePosition,
      render: (row) => (
        <div className="text-uppercase">
          {row.positionEmployee.namePosition}
        </div>
      ),
      filterable: true,
    },
    {
      key: "branch",
      label: "Sucursal",
      accessor: (row) => row.branchEmployee.name,
      filterable: true,
      render: (row) => (
        <div className="text-uppercase">{row.branchEmployee.name}</div>
      ),
    },
  ];

  const handleModify = () => {
    if (selectedIds.length === 0)
      return modalError("No hay registros seleccionados");

    if (selectedIds.length > 1)
      return modalError("Sólo modificar un registro a la vez");

    const registro = eventos.find(
      (even) => even.checks.id === Number(selectedIds)
    );

    setModalModify({
      show: !modalModify.show,
      status: registro?.checks.status || "",
      type: registro?.checks.type || "",
    });
  };

  const onSubmitData = async (
    type: string,
    status: string
  ): Promise<ActionResponse<boolean>> => {
    const registro = eventos.find(
      (even) => even.checks.id === Number(selectedIds)
    );

    const idRegistro = registro?.id || null;
    const idCheck = registro?.checks.id || null;

    const res = await updateRegristrosChecador({
      idCheck,
      idRegistro,
      status,
      type,
    });

    return res;
  };

  return (
    <>
      <ListView>
        <ListView.Header
          title={`Eventos de checador (${eventos.length || 0})`}
          actions={[
            {
              action: handleModify,
              string: (
                <>
                  <i className="bo bi-pencil me-1"></i>
                  <span>Modificar</span>
                </>
              ),
            },
          ]}
        ></ListView.Header>
        <ListView.Body>
          <TableTemplate
            getRowId={(row) => row.checks.id}
            data={eventos}
            columns={columns}
            viewForm="/app/eventos?view_type=list"
            onSelectionChange={setSelectedIds}
          />
        </ListView.Body>
      </ListView>
      <ModifyModalForm
        show={modalModify.show}
        onHide={() => setModalModify({ ...modalModify, show: false })}
        sendData={onSubmitData}
        status={modalModify.status}
        type={modalModify.type}
      />
    </>
  );
}

export default EventosListView;
