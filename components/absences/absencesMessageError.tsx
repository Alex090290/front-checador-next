"use client"
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { useState } from "react";


export default function AbsenceOneError() {

    const router = useRouter();
    const [, setLoading] = useState(false);
    const [, setMessageLoading] = useState("");

    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando datos...");

        setTimeout(() => {
            router.push("/app/absences");
        }, 100);
    }
    return (
        <>

            <div className="container py-5 align-items-center">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center p-5">

                                <div className="mb-4">
                                    <i
                                        className="bi bi-calendar-x text-danger"
                                        style={{ fontSize: "4rem" }}
                                    />
                                </div>

                                <h2 className="fw-bold mb-3">
                                    Registo de faltas y asistencias no encontrado
                                </h2>

                                <p className="text-muted mb-4">
                                    El registro de faltas y asistencias que intentas consultar no existe,
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

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
