"use client";

import { identifyEmployeeByFace } from "@/app/actions/employee-actions";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

type Props = {
  lat?: number;
  lng?: number;
  onEnableManual: () => void;
  onFaceSuccess: (message: string) => void;
};

export default function FaceCheckPanel({
  lat = 0,
  lng = 0,
  onEnableManual,
  onFaceSuccess,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("Colócate frente a la cámara");

  useEffect(() => {
    handleOpenCamera();

    return () => {
      stopCamera();

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const handleOpenCamera = async () => {
    try {
      setStartingCamera(true);
      setMessage("Abriendo cámara...");

      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        streamRef.current = stream;
      }

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
      }, 50);

      setMessage("Colócate frente a la cámara");
    } catch (error) {
      console.error(error);
      setMessage("No se pudo acceder a la cámara");
      onEnableManual();
    } finally {
      setStartingCamera(false);
    }
  };

  const capturePhotoAsFile = async (): Promise<File | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return null;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.95)
    );

    if (!blob) return null;

    return new File([blob], `check-face-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
  };

  const resetForNextEmployee = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setMessage("Colócate frente a la cámara");
    }, 2000);
  };

  const handleFaceCheck = async () => {
    try {
      setProcessing(true);
      setMessage("Capturando foto...");

      const file = await capturePhotoAsFile();

      if (!file) {
        toast.error("No se pudo capturar la foto");
        setMessage("No se pudo capturar la foto");
        onEnableManual();
        return;
      }

      setMessage("Validando rostro...");

      const res = await identifyEmployeeByFace({
        file,
        lat,
        lng,
      });

      if (!res.success) {
        setMessage(res.message || "No se pudo validar por rostro");
        toast.error(res.message || "No se pudo validar por rostro");
        onEnableManual();
        return;
      }

      const successMessage =
        res.data?.checkMessage || res.message || "Checada registrada por rostro";

      setMessage(successMessage);
      toast.success(successMessage);
      onFaceSuccess(successMessage);

      resetForNextEmployee();
    } catch (error) {
      console.error(error);
      setMessage("Error al validar por rostro");
      toast.error("Error al validar por rostro");
      onEnableManual();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-3 border rounded bg-body-tertiary h-100">
      <h5 className="mb-3">Checado por rostro</h5>

      <Alert
        variant={processing || startingCamera ? "warning" : "info"}
        className="mb-3"
      >
        <div className="d-flex align-items-center gap-2">
          {(processing || startingCamera) && (
            <Spinner animation="border" size="sm" />
          )}
          <span>{message}</span>
        </div>
      </Alert>

      {cameraOpen ? (
        <div className="text-center">
          <video
            ref={videoRef}
            className="w-100 rounded"
            style={{ maxHeight: 300, objectFit: "cover" }}
            autoPlay
            playsInline
            muted
          />

          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button
              variant="primary"
              onClick={handleFaceCheck}
              disabled={processing || startingCamera}
            >
              {processing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Validando...
                </>
              ) : (
                "Validar rostro"
              )}
            </Button>

            <Button
              variant="outline-secondary"
              onClick={onEnableManual}
              disabled={processing || startingCamera}
            >
              Usar código y contraseña
            </Button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          <Button
            variant="primary"
            onClick={handleOpenCamera}
            disabled={startingCamera || processing}
          >
            {startingCamera ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Abriendo cámara...
              </>
            ) : (
              "Abrir cámara"
            )}
          </Button>

          <Button
            variant="outline-secondary"
            onClick={onEnableManual}
            disabled={startingCamera || processing}
          >
            Usar código y contraseña
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}