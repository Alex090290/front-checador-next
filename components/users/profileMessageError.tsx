"use client"
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { useState } from "react";


// message: el motivo real (ej. el back no respondió /me) en lugar del texto genérico de "no encontrado"
export default function ProfileError({ title, message }: { title?: string; message?: string } = {}) {

    const router = useRouter();
    const [, setLoading] = useState(false);
    const [, setMessageLoading] = useState("");


    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando datos...");

        setTimeout(() => {
            router.push("/app/");
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
                                        className="bi bi-person-fill-slash text-danger"
                                        style={{ fontSize: "6rem" }}
                                    />
                                </div>

                                <h2 className="fw-bold mb-3">
                                    {title ?? "Perfil no encontrado"}
                                </h2>

                                <p className="text-muted mb-4">
                                    {message ?? "El perfil que intentas consultar no existe, fue eliminado o no se encuentra disponible."}
                                </p>

                                <div className="justify-content-center gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleBack}
                                    >
                                        <i className="bi bi-arrow-left me-2" />
                                        Volver
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
