"use client";

import { createDepartment } from "@/app/actions/departments-actions";
import { Entry, RelationField } from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
  FormSheet,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Department, User } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Col, ListGroup, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import PositionFormCreate from "./PositionFormCreate";

function DepartmentsFormView({
  department,
  id,
  usersRelation,
}: {
  department: Department | null;
  id: number;
  usersRelation: User[];
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

  const { modalError } = useModals();

  const originalValuesRef = useRef<Department | null>(null);
  const router = useRouter();

  const [positionFormShow, setPositionFormShow] = useState(false);

  const onSubmit: SubmitHandler<Department> = async (data) => {
    if (isNaN(id)) {
      const res = await createDepartment({ data });
      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
      router.back();
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
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
      console.log(department);
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
        title="Departamentos"
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
            options={usersRelation.map((user) => ({
              id: user.id,
              displayName: user.name,
              name: user.name,
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
                    <div className="p-2 border rounded text-center bg-body-tertiary">
                      {puesto.namePosition}
                    </div>
                  </Col>
                ))}
              </Row>
            </FormSheet>
          </FormPage>
        </FormBook>
      </FormView>
      <PositionFormCreate
        idDepartment={id}
        show={positionFormShow}
        onHide={() => setPositionFormShow(!positionFormShow)}
      />
    </>
  );
}

export default DepartmentsFormView;
