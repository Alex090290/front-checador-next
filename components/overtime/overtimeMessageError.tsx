"use client"

import router from "next/router";
import { Button } from "react-bootstrap";

export default function OvertimeOneError(){
    return (
        <div className="container py-5">
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
                                    onClick={() => router.push("/app/overtime")}
                                >
                                    <i className="bi bi-arrow-left me-2" />
                                    Volver al listado
                                </Button>

                                <Button
                                    variant="outline-primary"
                                    onClick={() => router.push("/app/overtime/create")}
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
    );
}
