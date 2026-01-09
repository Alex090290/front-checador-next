"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
  TableTemplateRef,
} from "@/components/templates/TableTemplate";
import { useModals } from "@/context/ModalContext";
import {
  ActionResponse,
  Employee,
  ICheckInFeedback,
  User,
} from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useEffect, useRef, useState } from "react";
import ModifyModalForm from "./ModifyModalForm";
import {
  searchEventosParams,
  updateRegristrosChecador,
} from "@/app/actions/eventos-actions";
import { Button, Form } from "react-bootstrap";
import { Many2one } from "@/components/fields/Many2one";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type TSearchInputs = {
  date: string | null;
  idEmployee: number | null;
  idUser: number | null;
};

function EventosListView({
  users,
  eventos,
  employees,
}: {
  users: User[];
  employees: Employee[];
  eventos: ICheckInFeedback[];
}) {
  const { data: eventosSwr } = useSWR("/api/eventos", fetcher);

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<TSearchInputs>({
    defaultValues: {
      date: null,
      idEmployee: null,
      idUser: null,
    },
  });

  const { modalError } = useModals();

  const tableRef = useRef<TableTemplateRef>(null);

  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [modalModify, setModalModify] = useState<{
    show: boolean;
    type: string;
    status: string;
  }>({ show: false, type: "", status: "" });

  const [eventosList, setEventosList] = useState<ICheckInFeedback[]>([]);

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
      accessor: (row) =>
        `${row.employee.lastName?.toUpperCase()} ${row.employee.name?.toUpperCase()}`,
      filterable: true,
      render: (row) => (
        <div className="text-uppercase" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/app/employee?view_type=form&id=${row.employee.id}`}
            className="text-decoration-none"
          >
            {row.employee.lastName} {row.employee.name}
            <i className="bi bi-box-arrow-up-right ms-2"></i>
          </Link>
        </div>
      ),
    },
    {
      key: "type",
      label: "Evento",
      filterable: true,
      accessor: (row) => row.checks.type.replace(/_/g, " ").toUpperCase(),
      render: (row) => (
        <div
          className={`rounded text-center fw-semibold px-2 ${
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
          <div className="text-end" style={{ width: "50%" }}>
            {row.checks.minutesDifference}
          </div>
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
    status: string,
    dateHour: string,
    minutesDifference: string
  ): Promise<ActionResponse<boolean>> => {
    const registro = eventosList.find(
      (even) => even.checks.id === Number(selectedIds)
    );

    const idRegistro = registro?.id || null;
    const idCheck = registro?.checks.id || null;

    const res = await updateRegristrosChecador({
      idCheck,
      idRegistro,
      status,
      type,
      dateHour,
      minutesDifference: Number(minutesDifference),
    });

    if (!res.success) {
      modalError(res.message);
      return res;
    }

    const changedList = eventosList.map((evento) => {
      if (evento.checks.id === idCheck && evento.id === idRegistro) {
        evento = {
          ...evento,
          checks: {
            ...evento.checks,
            type,
            status,
          },
        };
      }
      return evento;
    });

    console.log(changedList);

    setEventosList(changedList);
    tableRef.current?.clearSelection();

    return res;
  };

  const onSubmitSearch: SubmitHandler<TSearchInputs> = async (data) => {
    const res = await searchEventosParams({
      ...data,
      idEmployee: Number(data.idEmployee),
      idUser: Number(data.idUser),
    });

    if (res.length <= 0) {
      setEventosList([]);
      modalError("No se encontraron datos");
      return;
    }

    setEventosList(res);
  };

  const handleUpdateList = () => {
    reset({ date: null, idEmployee: null, idUser: null });
    setEventosList(eventos);
  };

  useEffect(() => {
    setEventosList(eventos);
  }, [eventos]);

  return (
    <>
      <ListView>
        <ListView.Header
          title={`Eventos de checador (${eventosList.length || 0})`}
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
        >
          <Form onSubmit={handleSubmit(onSubmitSearch)}>
            <fieldset className="d-flex flex-row gap-2" disabled={isSubmitting}>
              <Form.Control
                {...register("date")}
                type="date"
                placeholder="Fecha"
                autoComplete="off"
              />
              <Many2one
                className="text-uppercase"
                control={control}
                {...register("idEmployee")}
                callBackMode="id"
                options={employees.map((e) => ({
                  id: e.id || 0,
                  displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                  name: e.name,
                }))}
                label="Empleado"
              />
              <Many2one
                className="text-uppercase"
                control={control}
                {...register("idUser")}
                callBackMode="id"
                options={users
                  .filter((u) => u.role === "CHECADOR")
                  .map((u) => ({
                    id: u.id,
                    displayName: `${u.name.toUpperCase()} ${u.lastName.toUpperCase()}`,
                    name: `${u.name} ${u.lastName}`,
                  }))}
                label="Checador"
              />
              <Button type="submit" disabled={!isDirty}>
                <i className="bi bi-search"></i>
              </Button>
              <Button type="button" variant="info" onClick={handleUpdateList}>
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
            </fieldset>
          </Form>
        </ListView.Header>
        <ListView.Body>
          <TableTemplate
            ref={tableRef}
            getRowId={(row) => row.checks.id}
            data={eventosSwr ?? []}
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
