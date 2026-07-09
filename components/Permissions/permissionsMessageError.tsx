"use client"
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { useState } from "react";


export default function PermissionsOneError() {

    const router = useRouter();
    const [, setLoading] = useState(false);
    const [, setMessageLoading] = useState("");


    const handleCreate = () => {
        setLoading(true);
        setMessageLoading('Cargando...');
        router.push("/app/permissions/create");
    };

    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando datos...");
        router.push("/app/permissions");
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
                                        className="bi bi-file-earmark-x text-danger"
                                        style={{ fontSize: "4rem" }}
                                    />
                                </div>

                                <h2 className="fw-bold mb-3">
                                    Permiso no encontrado
                                </h2>

                                <p className="text-muted mb-4">
                                    El permiso que intentas consultar no existe,
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
                                        Nuevo permiso
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
