"use client";

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

type TInputs = {
  login: string;
  password: string;
};

function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<TInputs> = async () => {};

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs="11" sm="8" md="5" lg="4" xl="3" xxl="3">
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="card shadow-md mt-5 bg-body-tertiary"
          >
            <fieldset className="card-body">
              <legend className="card-title d-flex justify-content-between">
                Inicio de sesión
              </legend>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <i className="bi bi-person-fill"></i>
                </InputGroup.Text>
                <Form.Control
                  {...register("login", {
                    required: "Este campo es requerido",
                  })}
                  className="text-center"
                  placeholder="Usuario"
                  type="text"
                  autoComplete="off"
                  autoFocus
                  isInvalid={!!errors.login}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.login?.message}
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
                      <span className="ms-2">Validando</span>
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
