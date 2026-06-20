"use client";

import { checkIn } from "@/app/actions/entry-actions";
import ChecadorEntryForm from "@/components/forms/ChecadorEntryForm";
import FaceCheckPanel from "@/components/checador/FaceCheckPanel";
import Clock from "@/components/top-nav/Clock";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDate } from "date-fns";
import { Alert, Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { formatDatelocal } from "@/lib/helpers";
import toast from "react-hot-toast";
import { ActionResponse, ICheckInFeedback, INewsletter } from "@/lib/definitions";
import useSWR from "swr";
import Image from "next/image";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type TCheckData = {
  idCheck: string;
  passwordCheck: string;
};

export default function ChecadorFormView({
  limit = "500"
}) {
  const { data: activeNotice } = useSWR("/api/notice", fetcher);
  const { data: checkData, mutate } = useSWR(`/api/checador?limit=${limit}`, fetcher);


  const toastIdRef = useRef<string>("");


  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [feedbackDisplay, setFeedbackDisplay] = useState<ICheckInFeedback[]>([]);
  const [message, setMessage] = useState<string>("");

  const [manualEnabled, setManualEnabled] = useState(false);

  const [showImg, setShowImg] = useState(false)
  const [showTitleNotice, setTitleNotice] = useState(false);
  const [showTextNotice, setShowTextNotice] = useState(false);
  const [dataNotice, setDataNotice] = useState<INewsletter>({
    _id: "",
    id: 0,
    title: "",
    text: "",
    img: "",
    programing: false,
    dateInitiPublish: "",
    dateEndPublish: "",
    hourEndPublish: "",
    hourInitiPublish: "",
    createAt: "",
    updateAt: "",
  });
  const pageLoading = !activeNotice || !checkData;

  useEffect(() => {

    if (!checkData) return;
    const newData = checkData?.data?.data ?? [];

    setFeedbackDisplay(newData);
  }, [checkData]);



  const receiveCheckData = async (
    data: TCheckData
  ): Promise<ActionResponse<string>> => {
    toastIdRef.current = toast.loading("Enviando datos...", {
      position: "top-center",
    });

    const newObj = {
      ...data,
      lat: location?.lat || 0,
      lng: location?.lon || 0,
    };

    const res = await checkIn(newObj);
    mutate()
    if (!res.success) {
      toast.error(res.message, { id: toastIdRef.current });
      return res;
    }

    setManualEnabled(false); // Este es para activar la camara
    setMessage(res?.data || "");
    await handleFetchFeedback();
    toast.success(res.message, { id: toastIdRef.current });
    
    return res;
  };

  const handleFetchFeedback = useCallback(async () => {
    let toastLoading = "";

    if (toastIdRef.current !== "") {
      toast.loading("Esperando respuesta...", { id: toastIdRef.current });
    } else {
      toastLoading = toast.loading("Cargando registros...");
    }

    if (toastIdRef.current !== "") {
      toast.success("Registro completado...", { id: toastIdRef.current });
    } else {
      toast.success("Se han cargado los registros...", { id: toastLoading });
    }
  }, []);

  useEffect(() => {
    if (!activeNotice) return;

    setDataNotice(activeNotice);

    setShowImg(activeNotice.img !== "");
    setTitleNotice(activeNotice.title !== "");
    setShowTextNotice(activeNotice.text !== "");
  }, [activeNotice]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocalización no soportada por este navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition( 
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
      },
      (err) => {
        console.log(`Error obteniendo la ubicación: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  const handleEnableManual = () => {
    setManualEnabled(true);
    setMessage("No fue posible validar por rostro. Puedes continuar con código y contraseña.");
  };

  const handleFaceSuccess = async (faceMessage: string) => {
    setManualEnabled(false);
    mutate()
    setMessage(faceMessage);
    await handleFetchFeedback();
  };


  return (
    <>
      {/* <style>{`
        @media (min-width: 768px) {
          .checador-layout  { height: 100vh; overflow: hidden; }
          .checador-body    { overflow: hidden; }
          .checador-row     { height: 100%; }
          .checador-col     { height: 80%; }
        }
      `}</style> */}

      <style>{`
  /* Mobile: permite scroll */
  .checador-layout {
    min-height: 100vh;
    overflow-y: auto;
  }

  .checador-body {
    overflow-y: visible;
  }

  /* Desktop real: bloquea scroll */
  @media (min-width: 992px) {
    .checador-layout {
      height: 100vh;
      overflow: hidden;
    }

    .checador-body {
      overflow: hidden;
    }

    .checador-row {
      height: 100%;
    }

    .checador-col {
      height: 80%;
    }
  }

  /* Mobile horizontal */
  @media (max-width: 991.98px) and (orientation: landscape) {
    .checador-layout {
      height: auto;
      min-height: 100vh;
      overflow-y: auto;
    }

    .checador-body {
      overflow-y: visible;
    }

    .checador-col {
      height: auto;
    }
  }
`}</style>

      <ConditionalRender cond={pageLoading}>
        <Loading message="Cargando..." />
      </ConditionalRender>

      <ConditionalRender cond={!pageLoading}>
        <Container fluid className="px-0 checador-layout">
          <Row className="g-0">
            <Col lg="12" className="d-flex flex-column">
              <Card className="d-flex flex-column border-0 w-100">

                {/* HEADER */}
                <Card.Header className="border-0 flex-shrink-0">
                  <div className="d-flex justify-content-between align-items-center fw-bolder flex-wrap gap-2">
                    <Button
                      onClick={() => signOut()}
                      variant="outline-info"
                      className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    >
                      <i className="bi bi-arrow-left" />
                      Salir
                    </Button>
                    <div
                      className="shadow-sm px-2 rounded text-center"
                      style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
                    >
                      {formatDatelocal(new Date())}
                    </div>
                    <div
                      className="text-center text-uppercase fw-bold"
                      style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
                    >
                      <Clock />
                    </div>
                  </div>
                </Card.Header>

                {/* BODY */}
                <Card.Body className="p-0 flex-grow-1 mx-2 mb-2 checador-body">
                  <Row className="g-2 checador-row">

                    {/* ── TABLA ─────────────────────────────────────────────
                        Mobile : order-2  (debajo de la cámara)
                        Desktop: order-1  (columna izquierda, full height)   */}
                    <Col
                      xs={12} lg={6}
                      className="order-2 order-lg-1 d-flex flex-column checador-col"
                    >
                      <div
                        className="table-responsive p-1 border rounded shadow"
                        style={{ overflowY: "auto", flex: 1 }}
                      >
                        <Table
                          size="sm"
                          borderless
                          hover
                          striped
                          className="text-uppercase"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <thead>
                            <tr className="table-active table-dark border-secondary rounded">
                              <th className="border-end">Nombre</th>
                              <th className="border-end">Hora</th>
                              <th className="border-end">Evento</th>
                              <th className="border-end">Departamento</th>
                              <th className="border-end">Puesto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedbackDisplay?.map((feed) => (
                              <tr key={feed?.checks?.id} className="border-bottom">
                                <td className="text-nowrap">
                                  {`${feed?.employee?.lastName} ${feed?.employee?.name}`}
                                </td>
                                <td className="text-nowrap text-center fw-semibold">
                                  {formatDate(feed?.checks?.timestamp, "HH:mm")}
                                </td>
                                <td className="text-nowrap">
                                  {feed?.checks?.type.replace(/_/g, " ").toUpperCase()}
                                </td>
                                <td className="text-nowrap">
                                  {feed?.departmentEmployee?.nameDepartment}
                                </td>
                                <td className="text-nowrap">
                                  {feed?.positionEmployee?.namePosition}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Col>

                    {/* ── COLUMNA DERECHA ────────────────────────────────────
                        Mobile : order-1  → solo muestra la cámara
                                           (noticias ocultas aquí en mobile)
                        Desktop: order-2  → cámara arriba + noticias abajo    */}
                    <Col
                      xs={12} lg={6}
                      className="order-1 order-lg-2 d-flex flex-column gap-2 checador-col"
                    >
                      {/* Cámara / formulario manual */}
                      <div className="border rounded shadow p-3 flex-shrink-0">
                        <ConditionalRender cond={!manualEnabled}>
                          <FaceCheckPanel
                            lat={location?.lat}
                            lng={location?.lon}
                            onEnableManual={handleEnableManual}
                            onFaceSuccess={handleFaceSuccess}
                          />
                        </ConditionalRender>

                        <ConditionalRender cond={manualEnabled}>
                          <Alert
                            variant="none"
                            className="rounded-pill py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle text-center fs-6"
                          >
                            {message}
                          </Alert>
                          <div className="d-flex justify-content-center">
                            <ChecadorEntryForm
                              receiveCheckData={receiveCheckData}
                              disabled={false}
                            />
                          </div>
                        </ConditionalRender>
                      </div>

                      {/* Noticias — SOLO DESKTOP (d-none en mobile) */}
                      <div className="border rounded shadow p-3 d-none d-lg-flex flex-column flex-grow-1 overflow-auto">
                        <ConditionalRender cond={showTitleNotice}>
                          <Card className="border-0">
                            <Card.Title className="text-uppercase text-center fs-3 mb-0">
                              {dataNotice.title}
                            </Card.Title>
                            <ConditionalRender cond={showTextNotice}>
                              <div className="text-uppercase text-center mt-2">
                                {dataNotice.text}
                              </div>
                            </ConditionalRender>
                          </Card>
                        </ConditionalRender>
                        <ConditionalRender cond={showImg}>
                          <div className="flex-fill d-flex justify-content-center align-items-center overflow-hidden">
                            <Image
                              src={dataNotice.img}
                              height={100}
                              width={100}
                              alt="NOTICE_img"
                              className="img-fluid h-100 w-auto object-fit-contain rounded-3"
                              unoptimized
                            />
                          </div>
                        </ConditionalRender>
                      </div>
                    </Col>

                    {/* ── NOTICIAS MOBILE ────────────────────────────────────
                        Solo visible en mobile (d-lg-none), order-3
                        En desktop las noticias viven dentro del col derecho   */}
                    <Col xs={12} className="order-3 d-lg-none">
                      <div className="border rounded shadow p-3 d-flex flex-column">
                        <ConditionalRender cond={showTitleNotice}>
                          <Card className="border-0">
                            <Card.Title className="text-uppercase text-center fs-3 mb-0">
                              {dataNotice.title}
                            </Card.Title>
                            <ConditionalRender cond={showTextNotice}>
                              <div className="text-uppercase text-center mt-2">
                                {dataNotice.text}
                              </div>
                            </ConditionalRender>
                          </Card>
                        </ConditionalRender>
                        <ConditionalRender cond={showImg}>
                          <div className="d-flex justify-content-center align-items-center mt-2">
                            <Image
                              src={dataNotice.img}
                              height={100}
                              width={100}
                              alt="NOTICE_img"
                              className="img-fluid w-auto object-fit-contain rounded-3"
                              unoptimized
                            />
                          </div>
                        </ConditionalRender>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </ConditionalRender>
    </>
  );
}

