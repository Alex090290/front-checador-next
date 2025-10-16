"use client";

import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Row,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { ButtonVariant } from "react-bootstrap/esm/types";
import OverLay from "./OverLay";

type FormViewProps = {
  id: number;
  name: string | null;
  title?: string;
  cleanUrl: string;
  children: React.ReactNode;
  formStates?: TFormState[];
  state?: string;
  isDirty: boolean;
  actions?: TFormActions[];
  disabled: boolean;
  onSubmit: React.MouseEventHandler<HTMLButtonElement>;
  reverse: () => void;
  modelThread?: string;
};

type TFormActions = {
  string: string | number | React.JSX.Element;
  action: () => void;
  invisible?: boolean;
  readonly?: boolean;
  variant?: ButtonVariant | "light";
};

export type TFormState = {
  name: string;
  label: string;
  decoration: ButtonVariant | "light";
};

function FormView({
  id,
  name,
  title,
  cleanUrl,
  children,
  formStates,
  state,
  isDirty,
  actions = [],
  disabled,
  onSubmit,
  reverse,
  modelThread,
}: FormViewProps) {
  const router = useRouter();

  return (
    <Row className="h-100 overflow-auto">
      <Col xs="12" md="8" className="h-100">
        <Form className="card d-flex flex-column h-100 border-0">
          <fieldset
            className="card-header d-flex justify-content-between gap-2 border-bottom-0"
            disabled={disabled}
          >
            {/* BOTONES DE FORMULARIO */}
            <div className="d-flex align-items-center gap-1">
              {!isNaN(id) && (
                <OverLay string="Crear nuevo registro">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.replace(cleanUrl)}
                  >
                    Nuevo
                  </Button>
                </OverLay>
              )}
              <Button
                size="sm"
                type="button"
                disabled={!isDirty}
                onClick={onSubmit}
              >
                {disabled ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <i className="bi bi-cloud-arrow-up-fill"></i>
                )}
              </Button>
              <OverLay string="Deshacer cambios">
                <Button
                  size="sm"
                  type="button"
                  onClick={reverse}
                  disabled={!isDirty}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </Button>
              </OverLay>
              {title && <h4 className="m-0">{title}</h4>}
            </div>
            {/* BOTONES VISTA ESCRITORIO */}
            <div className="d-none d-md-flex gap-1 align-items-center">
              {actions.map((action, index) => (
                <Button
                  key={`${action.string}-${index}`}
                  variant={action.variant ?? "light"}
                  type="button"
                  onClick={action.action}
                  disabled={action.readonly}
                  style={{ display: action.invisible ? "none" : "block" }}
                >
                  {action.string}
                </Button>
              ))}
            </div>
            {/* BOTONES VISTA MÓVIL */}
            <div className="d-flex d-md-none">
              <DropdownButton variant="light" title="Acciones" align="end">
                {actions.map((action, index) => (
                  <Dropdown.Item
                    key={`${action.string}-${index}`}
                    as={Button}
                    variant={action.variant ?? "light"}
                    onClick={action.action}
                    disabled={action.readonly}
                    style={{ display: action.invisible ? "none" : "block" }}
                  >
                    {action.string}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </div>
            <OverLay string="Regresar">
              <Button
                size="sm"
                onClick={() => router.back()}
                disabled={isDirty}
              >
                <i className="bi bi-arrow-left"></i>
              </Button>
            </OverLay>
          </fieldset>
          <fieldset
            className="card-body  flex-fill overflow-auto"
            disabled={disabled}
          >
            <div className="d-flex justify-content-between align-items-center">
              <legend className="card-title h3 fw-semibold text-uppercase">
                {name ?? "Nuevo"}
              </legend>
              {/* STATEBAR DESKTOP VIEW */}
              <div className="d-none d-md-flex gap-1">
                <ButtonGroup>
                  {formStates?.map((st, index) => (
                    <Button
                      key={`${st.label}-${st.name}-${index}`}
                      variant={
                        st.name === state ? st.decoration : "outline-light"
                      }
                      className={`${
                        st.name === state ? "fw-semibold" : "text-dark"
                      } text-uppercase`}
                    >
                      {st.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              {/* STATEBAR - Mobile (Dropdown) */}
              {formStates && (
                <div className="d-flex d-md-none">
                  <Button
                    size="sm"
                    variant={
                      formStates.find((st) => st.name === state)?.decoration
                    }
                    className="fw-semibold text-uppercase"
                  >
                    {formStates.find((st) => st.name === state)?.label}
                  </Button>
                </div>
              )}
            </div>
            <Container fluid>
              <FormSheet>{children}</FormSheet>
            </Container>
          </fieldset>
        </Form>
      </Col>
      <Col xs="12" md="4" className="h-100"></Col>
    </Row>
  );
}

export const FieldGroup = ({
  children,
  readonly,
  invisible,
  className,
}: {
  children: React.ReactNode;
  readonly?: boolean;
  invisible?: boolean;
  className?: string;
}) => {
  return (
    <Col
      className={className}
      style={{ display: invisible ? "none" : "inline-block" }}
      xs="12"
      sm="6"
      md="6"
      lg="6"
      xl="6"
      xxl="6"
    >
      <fieldset disabled={readonly} className="p-3 rounded bg-body-tertiary">
        {children}
      </fieldset>
    </Col>
  );
};

const FieldGroupStack = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`d-flex justify-content-between align-items-end gap-1 p-0 ${className}`}
    >
      {children}
    </div>
  );
};

FieldGroup.Stack = FieldGroupStack;

export const FieldGroupFluid = ({
  children,
  readonly,
  invisible,
  className,
}: {
  children: React.ReactNode;
  readonly?: boolean;
  invisible?: boolean;
  className?: string;
}) => {
  return (
    <Col
      className={className}
      style={{ display: invisible ? "none" : "inline-block" }}
      md="12"
    >
      <fieldset disabled={readonly} className="p-3 rounded bg-body-tertiary">
        {children}
      </fieldset>
    </Col>
  );
};

export const FormBook = ({
  children,
  dKey,
}: {
  children: React.ReactNode;
  dKey: string;
}) => {
  return (
    <Col md="12" className="mt-2">
      <Tabs defaultActiveKey={dKey} transition={false}>
        {children}
      </Tabs>
    </Col>
  );
};

export const FormPage = ({
  children,
  eventKey,
  title,
}: {
  children: React.ReactNode;
  eventKey: string;
  title: string;
}) => {
  return (
    <Tab eventKey={eventKey} title={title}>
      {children}
    </Tab>
  );
};

export const PageSheet = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Container fluid className={`${className}`}>
      {children}
    </Container>
  );
};

export const FormSheet = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Container>
      <Row className={`${className}`}>{children}</Row>
    </Container>
  );
};

export default FormView;
