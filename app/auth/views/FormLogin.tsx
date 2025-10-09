"use client";

import { userLogin } from "@/app/actions/user-actions";
import { useModals } from "@/context/ModalContext";
import { useRouter } from "next/navigation";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  email: string;
  password: string;
};

function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const { modalError } = useModals();

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    const res = await userLogin(data);

    console.log(res);

    if (!res.success) {
      modalError(res.message);
      return;
    }

    toast.success("Se ha iniciado sesión");
    // router.replace("/app/checador?view_type=form");
    router.replace("/");
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs="11" sm="8" md="5" lg="4" xl="3" xxl="3">
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="card shadow-md mt-5 bg-body-tertiary"
          >
            <fieldset className="card-body" disabled={isSubmitting}>
              <legend className="card-title d-flex justify-content-between">
                Inicio de sesión
              </legend>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <i className="bi bi-person-fill"></i>
                </InputGroup.Text>
                <Form.Control
                  {...register("email", {
                    required: "Este campo es requerido",
                  })}
                  className="text-center"
                  placeholder="Usuario"
                  type="text"
                  autoComplete="off"
                  autoFocus
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </InputGroup>
              <InputGroup className="mb-2">
                <InputGroup.Text>
                  <i className="bi bi-lock-fill"></i>
                </InputGroup.Text>
                <Form.Control
                  {...register("password", {
                    required: "Este campo es requerido",
                  })}
                  className="text-center"
                  placeholder="Contraseña"
                  type="password"
                  autoComplete="off"
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Group className="d-grid">
                <Button type="submit">
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" animation="border" />
                      <span className="ms-2">Iniciando...</span>
                    </>
                  ) : (
                    <>Entrar</>
                  )}
                </Button>
              </Form.Group>
            </fieldset>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default FormLogin;
