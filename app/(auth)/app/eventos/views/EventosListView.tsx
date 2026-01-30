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
  deleteRegristrosChecador,
  generateFault,
  searchEventosParams,
  updateRegristrosChecador,
} from "@/app/actions/eventos-actions";
import { Button, Form } from "react-bootstrap";
import { Many2one } from "@/components/fields/Many2one";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import useSWR from "swr";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import ModalBlur from "@/components/ModalBlur";
import FormUpdateEvent from "./UpdateDataEvent";

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
  // ✅ SWR tipado + fallback para no parpadear
  const { data: eventosSwr, mutate } = useSWR<ICheckInFeedback[]>(
    "/api/eventos",
    fetcher,
    {
      fallbackData: eventos,
    }
  );

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [typeUpdate, setTypeUpdate] = useState("");
  const [messageLoading, setMessageLoading] = useState("");

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

  const { modalError, modalConfirm } = useModals();

  const tableRef = useRef<TableTemplateRef>(null);

  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [modalModify, setModalModify] = useState<{
    show: boolean;
    type: string;
    status: string;
  }>({ show: false, type: "", status: "" });

  const [eventosList, setEventosList] = useState<ICheckInFeedback[]>(eventos);

  const [isFiltering, setIsFiltering] = useState(false);

  const [tableResetKey, setTableResetKey] = useState(0);

  const isClearingSelectionRef = useRef(false);

  const clearSelectedIds = () => {
    isClearingSelectionRef.current = true;

    tableRef.current?.clearSelection();
    setSelectedIds([]);
    setTableResetKey((k) => k + 1);

    // suelta el lock en el siguiente tick
    setTimeout(() => {
      isClearingSelectionRef.current = false;
    }, 0);
  };

  const handleSelectionChange = (ids: Array<string | number>) => {
    if (isClearingSelectionRef.current) return;
    setSelectedIds(ids);
  };

  useEffect(() => {
    if (!isFiltering) setEventosList(eventosSwr ?? []);
  }, [eventosSwr, isFiltering]);

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

  const handleGenerateFaults = () => {
    modalConfirm("¿Seguro que desea generar las faltas del día?", async () => {
      setMessageLoading(`Generando registros..`);
      setLoading(true);

      await generateFault()
        .then((r: any) => {
          mutate();
          setStatusUpdate("");
          setTypeUpdate("");
          clearSelectedIds();
          setLoading(false);
        })
        .catch((err) => {
          setStatusUpdate("");
          setTypeUpdate("");
          clearSelectedIds();
          setLoading(false);
        });
    });
  };

  const onSubmitData = async (
    type: string,
    status: string,
    dateHour: string,
    minutesDifference: string
  ): Promise<ActionResponse<boolean>> => {
    const idSel = Number(selectedIds[0]);
    const registro = eventosList.find((even) => even.checks.id === idSel);

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
        return {
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

    setEventosList(changedList);
    clearSelectedIds();

    return res;
  };

  const onSubmitSearch: SubmitHandler<TSearchInputs> = async (data) => {
    const res = await searchEventosParams({
      ...data,
      idEmployee: data.idEmployee ? Number(data.idEmployee) : null,
      idUser: data.idUser ? Number(data.idUser) : null,
    });

    setIsFiltering(true);

    if (!res || res.length <= 0) {
      setEventosList([]);
      modalError("No se encontraron datos");
      clearSelectedIds(); 
      return;
    }

    setEventosList(res);
    clearSelectedIds(); 
  };

  const handleUpdateList = () => {
    reset({ date: null, idEmployee: null, idUser: null });
    setIsFiltering(false);
    clearSelectedIds(); 
    mutate(); // opcional: fuerza refresco
  };

  const modal = () => {
    if (selectedIds.length === 0) return modalError("No hay registros seleccionados");
    if (selectedIds.length > 1) return modalError("Sólo modificar un registro a la vez");

    const idSel = Number(selectedIds[0]);
    const registro = eventosList.find((even) => even.checks.id === idSel);

    if (!registro) return modalError("No se encontró el registro seleccionado");

    const nextStatus = String(registro.checks.status ?? "");
    const nextType = String(registro.checks.type ?? "");

    setStatusUpdate(nextStatus);
    setTypeUpdate(nextType);

    setShowModal(true);
  };

  const modalDelete = async () => {
    if (selectedIds.length === 0) return modalError("No hay registros seleccionados");
    if (selectedIds.length > 1) return modalError("Sólo modificar un registro a la vez");

    const idSel = Number(selectedIds[0]);
    const registro = eventosList.find((even) => even.checks.id === idSel);

    if (!registro) return modalError("No se encontró el registro seleccionado");

    modalConfirm("¿Seguro que desea eliminar este registro?", async () => {
      setMessageLoading(`Eliminando registro...`);
      setLoading(true);

      await deleteRegristrosChecador({
        idRegistro: registro.id,
        idCheck: registro.checks.id,
      })
        .then((res: any) => {
          mutate();
          setStatusUpdate("");
          setTypeUpdate("");
          clearSelectedIds(); 
          setLoading(false);
        })
        .catch((err) => {
          mutate();
          setStatusUpdate("");
          setTypeUpdate("");
          clearSelectedIds(); 
          setLoading(false);
        });
    });
  };
  
  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <ConditionalRender cond={showModal}>
        <ModalBlur onClose={() => {
          clearSelectedIds()
          setShowModal(false)
          }} locked={isSubmitting}>
          <FormUpdateEvent
            show={modalModify.show}
            onHide={() => {
              clearSelectedIds()
              setShowModal(false)
            }}
            sendData={onSubmitData}
            status={statusUpdate}
            type={typeUpdate}
          />
        </ModalBlur>
      </ConditionalRender>

      <ListView>
        <ListView.Header
          title={`Eventos de checador (${eventosList.length || 0})`}
          actions={[
            {
              action: modal,
              string: (
                <>
                  <i className="bo bi-pencil me-1"></i>
                  <span>Modificar</span>
                </>
              ),
            },
            {
              action: handleGenerateFaults,
              string: (
                <>
                  <i className="bi bi-calendar-x-fill me-1"></i>
                  <span>Generar faltas</span>
                </>
              ),
            },
            {
              action: modalDelete,
              string: (
                <>
                  <i className="bi bi-trash3-fill" />
                  <span>Eliminar registro </span>
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
            key={tableResetKey}
            ref={tableRef}
            getRowId={(row) => row.checks.id}
            data={eventosList ?? []}
            columns={columns}
            viewForm="/app/eventos?view_type=list"
            onSelectionChange={handleSelectionChange} 
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
