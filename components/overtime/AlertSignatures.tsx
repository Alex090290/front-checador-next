import { Button } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
    onClose: () => void;
    pendingIds: number[];
};

export default function AlertSignatures({ onClose, pendingIds }: Props) {
    
     const [, setMessage] = useState("");
    
    
        useMemo(() => {
            if (pendingIds.length > 1) {
                setMessage("Tienes registros pendientes de firmar")
            } else if (pendingIds.length === 1) {
                setMessage("Tienes un registro pendiente de firmar")
            }
        }, [pendingIds]);

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
                backgroundColor: "rgba(0,0,0,0.7)",
                zIndex: 9999,
            }}
        >
            <div className="bg-white rounded p-4 text-center shadow">
                <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>

                <ConditionalRender cond={pendingIds.length >= 1}>

                    <h4 className="mt-3 text-dark">Tienes registros pendientes de firmar</h4>

                    <p className="text-dark mb-3">
                        Registros: {" "}
                        {pendingIds.map((id, index) => (
                            <span key={id}>
                                <Link href={`/app/overtime?view_type=form&id=${id}`} onClick={onClose}>
                                    {id}
                                </Link>
                                {index < pendingIds.length -1 && ", "}
                            </span>
                        ))}
                    </p>
                </ConditionalRender>


                <Button variant="warning" onClick={onClose}>
                    Entendido
                </Button>
            </div>
        </div>
    );
}