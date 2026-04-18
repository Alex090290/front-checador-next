"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Image } from "react-bootstrap";
import toast from "react-hot-toast";
import { enrollEmployeeFace } from "@/app/actions/employee-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

type Props = {
  employeeId: number;
  employeeName?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

type PreviewFile = {
  id: string;
  file: File;
  preview: string;
};

const MIN_FILES = 3;
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function RegisterBiometricModal({
  employeeId,
  employeeName,
  onClose,
  onSuccess,
}: Props) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  useEffect(() => {
    return () => {
      files.forEach((item) => URL.revokeObjectURL(item.preview));
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const buildPreviewFile = (file: File): PreviewFile => {
    return {
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    };
  };

  const addFiles = (incomingFiles: File[]) => {
    if (!incomingFiles.length) return;

    const validFiles: File[] = [];

    for (const file of incomingFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Archivo inválido: ${file.name}. Solo JPG y PNG.`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setFiles((prev) => {
      const availableSlots = MAX_FILES - prev.length;

      if (availableSlots <= 0) {
        toast.error(`Solo puedes registrar máximo ${MAX_FILES} fotos`);
        return prev;
      }

      const filesToInsert = validFiles.slice(0, availableSlots);

      if (validFiles.length > availableSlots) {
        toast.error(`Solo puedes registrar máximo ${MAX_FILES} fotos`);
      }

      const previewFiles = filesToInsert.map(buildPreviewFile);
      return [...prev, ...previewFiles];
    });

    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  const handleChangeUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    stopCamera();
    addFiles(selectedFiles);
  };

  const handleOpenCamera = async () => {
    try {
      if (files.length >= MAX_FILES) {
        toast.error(`Solo puedes registrar máximo ${MAX_FILES} fotos`);
        return;
      }

      setStartingCamera(true);
      setMessageLoading("Abriendo cámara...");
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo acceder a la cámara");
    } finally {
      setStartingCamera(false);
      setMessageLoading("");
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (files.length >= MAX_FILES) {
        toast.error(`Solo puedes registrar máximo ${MAX_FILES} fotos`);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        toast.error("No se pudo capturar la foto");
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        toast.error("La cámara aún no está lista");
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast.error("No se pudo procesar la imagen");
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      );

      if (!blob) {
        toast.error("No se pudo generar la foto");
        return;
      }

      const capturedFile = new File([blob], `face-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      addFiles([capturedFile]);
    } catch (error) {
      console.error(error);
      toast.error("Error al tomar la foto");
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((item) => item.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (files.length < MIN_FILES) {
      toast.error(`Debes registrar al menos ${MIN_FILES} fotos`);
      return;
    }

    try {
      setLoading(true);
      setMessageLoading("Registrando biométricos...");

      const res = await enrollEmployeeFace({
        idEmployee: employeeId,
        files: files.map((item) => item.file),
      });

      if (!res.success) {
        toast.error(res.message || "Error al registrar biométricos");
        return;
      }

      toast.success(res.message || "Biométricos registrados correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar biométricos");
    } finally {
      setLoading(false);
      setMessageLoading("");
    }
  };

  return (
    <div className="p-4">
      <ConditionalRender cond={loading || startingCamera}>
        <Loading message={messageLoading || "Cargando..."} />
      </ConditionalRender>

      <div className="mb-3 pe-4">
        <h4 className="mb-1">Registrar biométricos</h4>
        <div className="text-secondary">
          {employeeName
            ? `Empleado: ${employeeName}`
            : `Empleado #${employeeId}`}
        </div>
      </div>

      <Alert variant="info">
        Registra entre <strong>{MIN_FILES}</strong> y <strong>{MAX_FILES}</strong>{" "}
        fotografías claras del rostro del empleado. Idealmente:
        frontal, ligera izquierda y ligera derecha, con buena iluminación.
      </Alert>

      <div className="mb-3">
        <Form.Label className="fw-semibold">Selecciona una opción</Form.Label>

        <div className="d-flex flex-wrap gap-2 mb-2">
          <Button
            variant="outline-primary"
            onClick={() => uploadInputRef.current?.click()}
            disabled={loading || startingCamera || files.length >= MAX_FILES}
          >
            <i className="bi bi-upload me-2" />
            Subir archivo
          </Button>

          <Button
            variant="outline-success"
            onClick={handleOpenCamera}
            disabled={loading || startingCamera || files.length >= MAX_FILES}
          >
            <i className="bi bi-camera me-2" />
            {startingCamera ? "Abriendo cámara..." : "Tomar foto"}
          </Button>
        </div>

        <div className="small text-secondary">
          Fotos registradas: {files.length} / {MAX_FILES}
        </div>

        <Form.Control
          ref={uploadInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple
          onChange={handleChangeUploadFile}
          disabled={loading}
          className="d-none"
        />
      </div>

      {cameraOpen && (
        <div className="mb-3">
          <div className="border rounded p-2 text-center">
            <video
              ref={videoRef}
              className="w-100 rounded"
              style={{ maxHeight: 360, objectFit: "cover" }}
              autoPlay
              playsInline
              muted
            />

            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button
                variant="success"
                onClick={handleTakePhoto}
                disabled={files.length >= MAX_FILES || loading}
              >
                <i className="bi bi-camera-fill me-2" />
                Capturar foto
              </Button>

              <Button
                variant="secondary"
                onClick={stopCamera}
                disabled={loading}
              >
                Cancelar cámara
              </Button>
            </div>
          </div>
        </div>
      )}

      {!files.length && !cameraOpen && (
        <div className="text-secondary mb-3">
          Aún no has registrado ninguna imagen.
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-3">
          <div className="row g-3">
            {files.map((item, index) => (
              <div className="col-md-4" key={item.id}>
                <div className="border rounded p-2 h-100">
                  <div className="small fw-semibold mb-2">
                    Foto {index + 1}
                  </div>

                  <Image
                    src={item.preview}
                    alt={`Vista previa ${index + 1}`}
                    rounded
                    fluid
                    style={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                    }}
                  />

                  <div className="mt-2 d-grid">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFile(item.id)}
                      disabled={loading}
                    >
                      <i className="bi bi-trash me-2" />
                      Quitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="d-none" />

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || files.length < MIN_FILES}
        >
          {loading ? "Registrando..." : "Registrar biométricos"}
        </Button>
      </div>
    </div>
  );
}