"use client"
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";


export default function OvertimeOneError() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [, setMessageLoading] = useState("");


    const handleCreate = () => {
        setLoading(true);
        setMessageLoading('Cargando...');
        router.push("/app/overtime/create");
    };

    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando datos...");

        setTimeout(() => {
            router.push("/app/overtime");
        }, 100);
    }
    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={"Cargando..."} />
            </ConditionalRender>

            <div className="container py-5 align-items-center">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center p-5">

                                <div className="mb-4">
                                    <i
                                        className="bi bi-file-earmark-x text-danger"
                                        style={{ fontSize: "4rem" }}
                                    />
                                </div>

                                <h2 className="fw-bold mb-3">
                                    Registo de horas extra no encontrado
                                </h2>

                                <p className="text-muted mb-4">
                                    El registro que intentas consultar no existe,
                                    fue eliminada o no se encuentra disponible.
                                </p>

                                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleBack}
                                    >
                                        <i className="bi bi-arrow-left me-2" />
                                        Volver al listado
                                    </Button>

                                    <Button
                                        variant="outline-primary"
                                        onClick={handleCreate}
                                    >
                                        <i className="bi bi-plus-lg me-2" />
                                        Nuevo registro de horas extra
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
