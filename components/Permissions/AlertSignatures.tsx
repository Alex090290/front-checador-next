import { Button } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";

type Props = {
    onClose: () => void;
    pendingIds: number[];
};

export default function AlertSignaturesP({ onClose, pendingIds }: Props) {
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

                <ConditionalRender cond={pendingIds.length > 1}>

                    <h4 className="mt-3 text-dark">Tienes permisos pendientes de firmar</h4>

                    <p className="text-dark mb-3">
                        Registros: {pendingIds.join(", ")}
                    </p>
                </ConditionalRender>

                <ConditionalRender cond={pendingIds.length === 1}>

                    <h4 className="mt-3 text-dark"> Tienes un permiso pendiente de firmar</h4>

                    <p className="text-dark mb-3">
                        Registro: {pendingIds.join(", ")}
                    </p>
                </ConditionalRender>

                <Button variant="warning" onClick={onClose}>
                    Entendido
                </Button>
            </div>
        </div>
    );
}