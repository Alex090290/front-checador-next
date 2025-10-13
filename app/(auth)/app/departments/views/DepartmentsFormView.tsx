"use client";

import {
  createDepartment,
  updateDepartment,
} from "@/app/actions/departments-actions";
import { Entry, RelationField } from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
  FormSheet,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Department, Employee } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import PositionFormCreate from "./PositionFormCreate";
import OverLay from "@/components/templates/OverLay";
import { deletePosition } from "@/app/actions/positions-actions";

function DepartmentsFormView({
  department,
  id,
  employees,
}: {
  department: Department | null;
  id: number;
  employees: Employee[];
}) {
  const {
    register,
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Department>();

  const [puestos] = watch(["positions"]);

  const { modalError, modalConfirm } = useModals();

  const originalValuesRef = useRef<Department | null>(null);
  const router = useRouter();

  const [positionFormShow, setPositionFormShow] = useState(false);
  const [positionData, setPositionData] = useState<{
    activeId: number | null;
    namePosition: string;
  }>({ activeId: null, namePosition: "" });

  const onSubmit: SubmitHandler<Department> = async (data) => {
    if (isNaN(id)) {
      const res = await createDepartment({ data });
      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
      router.back();
    } else {
      const res = await updateDepartment({ data, id });

      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const handleDeletePuesto = async (activeId: number) => {
    modalConfirm("Confirmar accion", () => deletePuesto(activeId));
  };

  const deletePuesto = async (activeId: number) => {
    const res = await deletePosition({ id: activeId });
    if (!res.success) {
      modalError(res.message);
      return;
    }
    // const changedPuestos = puestos.filter((puesto) => puesto.id !== activeId);
    // reset({ positions: changedPuestos });
    toast.success(res.message);
  };

  const handleEditPosition = (
    activeId: number | null,
    namePosition: string
  ) => {
    setPositionData({ activeId, namePosition });
    setPositionFormShow(!positionFormShow);
  };

  useEffect(() => {
    if (!department) {
      const values: Department = {
        nameDepartment: "",
        description: "",
        idLeader: null,
        positions: [],
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: Department = {
        nameDepartment: department.nameDepartment,
        description: department.description,
        idLeader: department.idLeader,
        positions: department.positions,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [department, reset]);

  return (
    <>
      <FormView
        disabled={isSubmitting}
        reverse={handleReverse}
        cleanUrl="/app/departments?view_type=form&id=null"
        name={department?.nameDepartment || null}
        id={id}
        isDirty={isDirty}
        onSubmit={handleSubmit(onSubmit)}
        title="Departamento"
      >
        <FieldGroup>
          <Entry
            register={register("nameDepartment", {
              required: "Este campo es requerido",
            })}
            label="Nombre:"
            invalid={!!errors.nameDepartment}
            feedBack={errors.nameDepartment?.message}
          />
          <Entry register={register("description")} label="Descripción:" />
        </FieldGroup>
        <FieldGroup>
          <RelationField
            register={register("idLeader")}
            label="Líder:"
            control={control}
            callBackMode="id"
            className="text-capitalize"
            options={employees.map((emp) => ({
              id: emp.id ?? 0,
              displayName: `${emp.name} ${emp.lastName}`,
              name: `${emp.name} ${emp.lastName}`,
            }))}
          />
        </FieldGroup>
        <FormBook dKey="positions">
          <FormPage
            title={`Puestos (${department?.positions.length ?? 0})`}
            eventKey="positions"
          >
            <FormSheet>
              <Row className="g-1">
                <Col md="3">
                  <Button
                    variant="info"
                    onClick={() => setPositionFormShow(!positionFormShow)}
                  >
                    Crear
                  </Button>
                </Col>
              </Row>
              <Row className="g-1">
                {puestos?.map((puesto) => (
                  <Col md="4" key={puesto._id}>
                    <div className="p-2 border border-2 rounded text-center text-capitalize bg-body-tertiary d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">{puesto.namePosition}</span>
                      <div className="d-flex gap-1">
                        <OverLay string="Editar">
                          <Button
                            variant="link"
                            onClick={() =>
                              handleEditPosition(
                                puesto.id || null,
                                puesto.namePosition
                              )
                            }
                          >
                            <i className="bi bi-pencil text-info"></i>
                          </Button>
                        </OverLay>
                        <OverLay string="Eliminar">
                          <Button
                            variant="link"
                            onClick={() => handleDeletePuesto(puesto.id ?? 0)}
                          >
                            <i className="bi bi-trash text-danger"></i>
                          </Button>
                        </OverLay>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </FormSheet>
          </FormPage>
        </FormBook>
      </FormView>
      <PositionFormCreate
        positionData={positionData}
        idDepartment={id}
        show={positionFormShow}
        onHide={() => setPositionFormShow(!positionFormShow)}
      />
    </>
  );
}

export default DepartmentsFormView;
