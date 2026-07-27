import { IAbsence } from "@/lib/absences/interface";
import { ActionResponse, ModalBasicProps } from "@/lib/definitions";
import { SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useRef, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Entry } from "../fields";
import toast from "react-hot-toast";
import { updateAbsence } from "@/app/actions/absences-actions";
import { FieldGroup } from "../templates/FormView";
import { TInputsEmployee } from "@/app/(auth)/app/employee/definition";

type ModalAction = {
    absence?: IAbsence | null;
    id: number
};

interface IAbsenceJustify {
    "category": "justificada",
    "motiveJustify": "",
}

function getDefaultValues(absence?: IAbsence | null): Partial<IAbsence> {
    return {
        category: absence?.category ?? "",
        motiveJustify: absence?.motiveJustify ?? "",
    };
}

export default function FormUpdateAbsence({
    id,
    onHide,
    absence
}: ModalBasicProps & ModalAction) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        reset,
        register,
        handleSubmit,
        control,
        
        formState: { errors, isSubmitting },
    } = useForm<IAbsenceJustify>({
    });

    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleCancel = () => {
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files);
            setSelectedFiles(filesArray);

            // No llamamos a onFilesChange inmediatamente, esperamos a que el usuario haga clic en "Subir"
        }
    };
  //Alerta para antes de guardar 
  const onSubmit: SubmitHandler<IAbsenceJustify> = async (data) => {
    
console.log("DATA:", data);

  };
    const handleUpdateAbsence = async () => {
        if (!absence?.id) {
            return {
                success: false,
                message: "No hay usuario seleccionado",
                data: null,
            };
        }

        // const res = await updateAbsence({
        //     id: data.id,
        //     documents: data.documents,
        //     data
        // });

        // if (!res) {
        //     return {
        //         success: false,
        //         message: "No se pudo actualizar el usuario",
        //         data: null,
        //     };
        // }

        return {
            success: true,
            message: "Usuario actualizado correctamente",
            data: true,
        };
    };

    const handleUpload = async () => {
        if (selectedFiles.length > 0) {
            setLoading(true);
            const toastId = toast.loading("Subiendo archivo...");
            const formData = new FormData();

            // Agregar cada archivo al FormData
            selectedFiles.forEach((file) => {
                formData.append("files", file);
            });

            //   const res = await createDocument({
            //     formData,
            //     idEmployee,
            //     idDocument: doc.id,
            //     idPeriod: doc.idPeriod,
            //   });

            //   if (!res.success) return modalError(res.message);

            //   toast.success(res.message, { id: toastId });

            // Opcional: resetear el estado después de subir
            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setLoading(false);
        }
    };

    return (
        <>
            <ConditionalRender cond={loading || isSubmitting}>
                <Loading message="Cargando documento..." />
            </ConditionalRender>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-2">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h4 className="mb-1 fw-bold">Actualizar</h4>
                            {/* <p className="text-muted mb-0">
                            Agrega un nuevo documento con su rango de fechas y folio.
                        </p> */}
                        </div>

                        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                            Actualizar
                        </span>

                        <Col md={12}>
                            <Button variant="success" onClick={handleButtonClick}> Cargar </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf,.webp"
                                multiple
                                style={{ display: "none" }}
                            />
                            {selectedFiles.length > 0 && (
                                <div className="mb-2">
                                    <small className="text-muted">
                                        {selectedFiles.length} archivo(s) seleccionado(s)
                                    </small>
                                    {selectedFiles.slice(0, 2).map((file, index) => (
                                        <div key={index} className="small text-truncate">
                                            {file.name}
                                        </div>
                                    ))}
                                    {selectedFiles.length > 2 && (
                                        <div className="small text-muted">
                                            +{selectedFiles.length - 2} más
                                        </div>
                                    )}
                                </div>
                            )}
                        </Col>

                        <FieldGroup>
                            <FieldGroup.Stack>
                                <Entry register={register("category")} label="Categoria:" />
                                <Entry register={register("motiveJustify")} label="motivo:" />
                            </FieldGroup.Stack>
                        </FieldGroup>
                    </div>

                    {/* <Button variant="success" onClick={handleUpload}>
                    Subir
                </Button> */}
                    <Button variant="success" onClick={handleUpdateAbsence}>
                        Actualizar
                    </Button>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </Button>

                    {/* <Form onSubmit={onSubmit}>
                    <Card className="border rounded-4 mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-calendar-range text-primary" />
                                <h6 className="mb-0 fw-bold">Vigencia</h6>
                            </div>

                            <Row className="g-3">
                                <Col md={6}>
                                    <Entry
                                        type="date"
                                        register={register("dateInit", { required: true })}
                                        label="Fecha inicio"
                                        invalid={!!errors.dateInit}
                                        className="border"
                                    />
                                </Col>

                                <Col md={6}>
                                    <Entry
                                        type="date"
                                        register={register("dateEnd", { required: true })}
                                        label="Fecha fin"
                                        min={onChangeDateInit}
                                        invalid={!!errors.dateEnd}
                                        className="border"
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="border rounded-4 mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-upc-scan text-warning" />
                                <h6 className="mb-0 fw-bold">Folio</h6>
                            </div>

                            <Row className="g-3">
                                <Col md={12}>
                                    <Entry
                                        register={register("folio", { required: true })}
                                        label="Folio CITT"
                                        className="text-uppercase border"
                                        invalid={!!errors.folio}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="border rounded-4">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-file-earmark-arrow-up text-info" />
                                <h6 className="mb-0 fw-bold">Documento</h6>
                            </div>

                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Archivo
                                        </Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                                            className="border"
                                            {...register("document", { required: true })}
                                            isInvalid={!!errors.document}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Este campo es requerido
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={loading || isSubmitting}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" variant="success" disabled={loading || isSubmitting}>
                            {loading || isSubmitting ? "Cargando..." : "Cargar"}
                        </Button>
                    </div>
                </Form> */}
                </div>
            </Form>
        </>
    );
}