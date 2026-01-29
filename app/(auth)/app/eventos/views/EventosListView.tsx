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
import LoadingProgressBar from "@/components/LoadingProgressBar";
import Modal from "@/components/Modal";


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
  const {
    data: eventosSwr,
    mutate,
  } = useSWR<ICheckInFeedback[]>("/api/eventos", fetcher, {
    fallbackData: eventos,
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const { modalError,modalConfirm } = useModals();

  const tableRef = useRef<TableTemplateRef>(null);

  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [modalModify, setModalModify] = useState<{
    show: boolean;
    type: string;
    status: string;
  }>({ show: false, type: "", status: "" });

  const [eventosList, setEventosList] = useState<ICheckInFeedback[]>(eventos);

  // ✅ bandera para saber si estamos en “modo filtro”
  const [isFiltering, setIsFiltering] = useState(false);

  // ✅ si NO estamos filtrando, lo mostrado sigue a SWR
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
      render: (row) => <div className="text-uppercase">{row.branchEmployee.name}</div>,
    },
  ];

  const handleModify = () => {
    if (selectedIds.length === 0)
      return modalError("No hay registros seleccionados");

    if (selectedIds.length > 1)
      return modalError("Sólo modificar un registro a la vez");

    const idSel = Number(selectedIds[0]);
    const registro = eventosList.find((even) => even.checks.id === idSel);

    if (!registro) return modalError("No se encontró el registro seleccionado");

    setModalModify({
      show: !modalModify.show,
      status: registro.checks.status || "",
      type: registro.checks.type || "",
    });
  };  
  

  const handleDeletePuesto = () => {
      modalConfirm("¿Seguro que desea generar las faltas del día?", async() =>
      {
        setLoading(true)
        await generateFault().then((r:any)=>{
              setLoading(false)
        }).catch((err)=>{

            setLoading(false)
        })
      }
      );
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
    tableRef.current?.clearSelection();

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
      return;
    }

    setEventosList(res);
  };

  const handleUpdateList = async () => {
    reset({ date: null, idEmployee: null, idUser: null });
    setIsFiltering(false);
    tableRef.current?.clearSelection();
    setSelectedIds([]);
    await mutate(); // opcional: fuerza refresco
  };  
  const modal = () => {
      setShowModal(true)
  };

  return (
    <>
    <ConditionalRender cond={loading}>
        <Loading message="Generando registros..." />    
    </ConditionalRender>
    
      <ConditionalRender cond={showModal}>
        <Modal onClose={() => setShowModal(false)} locked={isSubmitting}>
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <div className="fw-semibold text-uppercase">Generar faltas</div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
              type="button"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <form className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Fecha</label>
                <input className="form-control" type="date" />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Empleado</label>
                <select className="form-select">
                  <option value="">Seleccionar...</option>
                  <option>JUAN PÉREZ</option>
                  <option>MARÍA LÓPEZ</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Checador</label>
                <select className="form-select">
                  <option value="">Seleccionar...</option>
                  <option>CHECADOR 1</option>
                  <option>CHECADOR 2</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Motivo</label>
                <input className="form-control" placeholder="Ej. Falta por inasistencia" />
              </div>

              <div className="col-12">
                <label className="form-label small text-muted">Notas</label>
                <textarea className="form-control" rows={3} placeholder="Opcional..." />
              </div>

              <div className="col-12 d-flex gap-2 align-items-center">
                <input className="form-check-input" type="checkbox" id="notify" />
                <label className="form-check-label small" htmlFor="notify">
                  Notificar al empleado
                </label>
              </div>
            </div>
          </form>

          <div className="p-3 border-top d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowModal(false)}
              type="button"
            >
              Cancelar
            </button>
            <button className="btn btn-primary" type="button" disabled={isSubmitting}>
              Aceptar
            </button>
          </div>
        </Modal>

      </ConditionalRender>



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
            {
              action: handleDeletePuesto,
              string: (
                <>
                  <i className="bi bi-calendar-x-fill me-1"></i>
                  <span>Generar faltas</span>
                </>
              ),
            },            
            {
              action: modal ,
              string: (
                <>
                  <span>Mostrar modal</span>
                </>
              ),
            }
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
            data={eventosList ?? []}
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
