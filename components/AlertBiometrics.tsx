import { Button } from "react-bootstrap";


type Props = {
    onClose: () => void;
};

export default function AlertBiometrics({ onClose }: Props) {
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

                <h4 className="mt-3 text-dark">Biométricos requeridos</h4>

                <p className="mb-3 text-dark">
                    Este empleado no tiene biométricos registrados.
                </p>

                <Button variant="warning" onClick={onClose}>
                    Entendido
                </Button>
            </div>
        </div>
    );
}


