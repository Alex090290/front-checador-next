"use client";

import {
  Button,
  ButtonGroup,
  Col,
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
  superActions?: TFormSuperActions[];
};

type TFormActions = {
  string: string | number | React.JSX.Element;
  action: () => void;
  invisible?: boolean;
  readonly?: boolean;
  variant?: ButtonVariant | "light";
};

type TFormSuperActions = {
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
  superActions,
  onSubmit,
  reverse,
  modelThread,
}: FormViewProps) {
  const router = useRouter();

  return (
    <Row className="h-100 overflow-auto">
      <Col xs="12" md="12" className="h-100">
        <Form className="card d-flex flex-column h-100 border-0">
          <fieldset
            className="card-header d-flex justify-content-between gap-2 border-bottom-0"
            disabled={disabled}
          >
            {/* BOTONES DE FORMULARIO */}
            <div className="d-flex align-items-center gap-2">
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
              {superActions && (
                <DropdownButton
                  size="sm"
                  title={<i className="bi bi-gear"></i>}
                >
                  {superActions.map((action, index) => {
                    if (action.invisible) return null;
                    return (
                      <Dropdown.Item
                        key={`${action.string}-${index}`}
                        as={Button}
                        variant={action.variant ?? "primary"}
                        onClick={action.action}
                        disabled={action.readonly}
                      >
                        {action.string}
                      </Dropdown.Item>
                    );
                  })}
                </DropdownButton>
              )}
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
                  size="sm"
                >
                  {action.string}
                </Button>
              ))}
            </div>
            {/* BOTONES VISTA MÓVIL */}
            <div className="d-flex d-md-none">
              <DropdownButton
                variant="info"
                title="Acciones"
                align="end"
                size="sm"
              >
                {actions.map((action, index) => {
                  if (action.invisible) return null;
                  return (
                    <Dropdown.Item
                      key={`${action.string}-${index}`}
                      as={Button}
                      variant={action.variant ?? "primary"}
                      onClick={action.action}
                      disabled={action.readonly}
                    >
                      {action.string}
                    </Dropdown.Item>
                  );
                })}
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
            <FormSheet>{children}</FormSheet>
          </fieldset>
        </Form>
      </Col>
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
  if (invisible) return null;
  return (
    <Col
      className={`${className} my-1`}
      xs="12"
      sm="6"
      md="6"
      lg="6"
      xl="6"
      xxl="6"
    >
      <fieldset disabled={readonly} className="rounded bg-body-tertiary p-2">
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
  className,
}: {
  children: React.ReactNode;
  readonly?: boolean;
  invisible?: boolean;
  className?: string;
}) => {
  return (
    <Col className={className} md="12">
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
    <Tabs defaultActiveKey={dKey} transition={false}>
      {children}
    </Tabs>
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
  return <Row className={`${className}`}>{children}</Row>;
};

export const FormSheet = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <Row className={`${className}`}>{children}</Row>;
};

export default FormView;
