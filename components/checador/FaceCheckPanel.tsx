"use client";

import { identifyEmployeeByFace } from "@/app/actions/employee-actions";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import Loading from "../LoadingSpinner";

type FeedbackState = "loading" | "success" | "error" | null;
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
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("Colócate frente a la cámara");

  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const displayState = feedback ?? (processing || startingCamera ? "loading" : null);


  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback(null);
      setFeedbackMsg("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [feedback]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  }, []);

  const handleOpenCamera = useCallback(async () => {
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
          videoRef.current.play().catch(() => { });
        }
      }, 50);

      setMessage("Colócate frente a la cámara");
    } catch (error) {
      console.error(error);
      setMessage("No se pudo acceder a la cámara");
      setFeedback("error");
      setFeedbackMsg("No se pudo acceder a la cámara");
    } finally {
      setStartingCamera(false);
    }
  }, []);

  useEffect(() => {
    handleOpenCamera();

    return () => {
      stopCamera();

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [handleOpenCamera, stopCamera]);

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
        setMessage("No se pudo capturar la foto");
        setFeedback("error");
        setFeedbackMsg("No se pudo capturar la foto");
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
        setFeedback("error");
        setFeedbackMsg(res.message || "No se pudo validar por rostro");
        return;
      }

      const successMessage =
        res.data?.checkMessage || res.message || "Checada registrada por rostro";

      setMessage(successMessage);
      setFeedback("success");
      setFeedbackMsg(successMessage);
      onFaceSuccess(successMessage);

      resetForNextEmployee();
    } catch (error) {
      setMessage("Error al validar por rostro");
      setFeedback("error");
      setFeedbackMsg("Error al validar por rostro");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <ConditionalRender cond={displayState === "loading"}>
        <Loading message="Cargando..." />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
            onEnableManual();
          }}
        />
      </ConditionalRender>

      <Row className="g-2">

        <Col md="6">
          <div className="p-3 border rounded bg-body-tertiary">
            <h5 className="mb-3 text-uppercase fw-bold">Checado por rostro</h5>

            <Alert
              variant={processing || startingCamera ? "warning" : "info"}
              className="mb-3"
            >
              <div className="d-flex align-items-center gap-2">

                <ConditionalRender cond={processing || startingCamera}>
                  <Spinner animation="border" size="sm" />
                </ConditionalRender>

                <span>{message}</span>
              </div>
            </Alert>
          </div>
        </Col>

        <Col md="6">
          <ConditionalRender cond={cameraOpen}>
            <div className="text-center">
              <video
                ref={videoRef}
                className="w-100 rounded"
                style={{ maxHeight: 310, objectFit: "contain" }}
                autoPlay
                playsInline
                muted
              />

              <div className="d-flex justify-content-center gap-2 mb-1">
                <Button
                  variant="primary"
                  onClick={handleFaceCheck}
                  disabled={processing || startingCamera}
                >
                  <ConditionalRender cond={processing}>
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Validando...
                    </>
                  </ConditionalRender>

                  <ConditionalRender cond={!processing}>
                    Validar rostro
                  </ConditionalRender>
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
          </ConditionalRender>

          <ConditionalRender cond={!cameraOpen}>
            <div className="d-flex flex-column gap-2">
              <Button
                variant="primary"
                onClick={handleOpenCamera}
                disabled={startingCamera || processing}
              >
                <ConditionalRender cond={startingCamera}>
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Abriendo cámara...
                  </>
                </ConditionalRender>

                <ConditionalRender cond={!startingCamera}>
                  Abrir cámara
                </ConditionalRender>

              </Button>

              <Button
                variant="outline-secondary"
                onClick={onEnableManual}
                disabled={startingCamera || processing}
              >
                Usar código y contraseña
              </Button>
            </div>
          </ConditionalRender>


          <canvas ref={canvasRef} className="d-none" />
        </Col>
      </Row>
    </>
  );
}