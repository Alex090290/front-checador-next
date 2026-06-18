"use client";

import {
  checkIn,
  fetchCheckInFeedback,
} from "@/app/actions/entry-actions";
import ChecadorEntryForm from "@/components/forms/ChecadorEntryForm";
import FaceCheckPanel from "@/components/checador/FaceCheckPanel";
import Clock from "@/components/top-nav/Clock";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDate } from "date-fns";
import { Alert, Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { formatDatelocal } from "@/lib/helpers";
import toast from "react-hot-toast";
import { ActionResponse, INewsletter } from "@/lib/definitions";
import useSWR from "swr";
import Image from "next/image";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type TCheckData = {
  idCheck: string;
  passwordCheck: string;
};

interface IFeedbackDisplay {
  id: number;
  name: string;
  timestamp: string;
  department: string;
  position: string;
  type: string;
}

export default function ChecadorFormView({
  limit = "500"
}) {
  const { data: activeNotice } = useSWR("/api/notice", fetcher);
  const { data: checkData, mutate } = useSWR(`/api/checador?limit=${limit}`, fetcher);


  const toastIdRef = useRef<string>("");

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [feedbackDisplay, setFeedbackDisplay] = useState<IFeedbackDisplay[]>([]);
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

    if (!res.success) {
      toast.error(res.message, { id: toastIdRef.current });
      return res;
    }

    setManualEnabled(false); // Este es para activar la camara
    setMessage(res?.data || "");
    await handleFetchFeedback();
    toast.success(res.message, { id: toastIdRef.current });
    mutate()
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
    setMessage(faceMessage);
    await handleFetchFeedback();
  };


  return (
    <>
      <ConditionalRender cond={pageLoading}>
        <Loading message="Cargando..." />
      </ConditionalRender>

      <ConditionalRender cond={!pageLoading}>
        <Container fluid className="px-0 min-vh-100 overflow-x-hidden">
          <Row className="g-2">
            <Col md="12">
              <Card className="d-flex flex-column border-0 w-100">

                <Card.Header className="border-0 me-3 w-100">
                  <div className="d-flex justify-content-between fw-bolder">
                    <Button
                      onClick={() => signOut()}
                      variant="outline-info"
                      className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    >
                      <i className="bi bi-arrow-left" />
                      Salir
                    </Button>

                    <div className="shadow-sm px-2 rounded fs-3 text-right">
                      {formatDatelocal(new Date())}
                    </div>

                    <div
                      className="text-right text-uppercase fw-bold"
                      style={{ fontSize: "2rem" }}
                    >
                      <Clock />
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="p-0 overflow-x-hidden flex-grow-1 m-2 h-100">
                  <Row className="g-2">

                    <Col md="6" className="d-flex flex-fill flex-column overflow-auto">
                      <div
                        className="table-responsive p-1 border rounded shadow"
                        style={{ maxHeight: "100vh", overflowY: "hidden" }}
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
                            {feedbackDisplay?.map((feed: any) => (
                              <tr
                                key={feed?.checks?.id}
                                className="border-bottom"
                              >
                                <td className="text-nowrap">
                                  {`${feed.employee.lastName} ${feed.employee.name}`}
                                </td>

                                <td className="text-nowrap text-center fw-semibold">
                                  {formatDate(feed.checks.timestamp, "HH:mm")}
                                </td>

                                <td className="text-nowrap">
                                  {feed.checks.type.replace(/_/g, " ").toUpperCase()}
                                </td>

                                <td className="text-nowrap">
                                  {feed.departmentEmployee.nameDepartment}
                                </td>

                                <td className="text-nowrap">
                                  {feed.positionEmployee.namePosition}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Col>

                  {/* Segunda columna */}
                    <Col md="6" className="d-flex flex-column gap-3" style={{height: "calc(100vh - 120px)"}}>

                      <div
                        className="border rounded shadow p-3 overflow-y-auto" style={{height: "calc(100vh - 150px)"}}
                      >
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

                      <div
                        className="border rounded shadow p-3 d-flex flex-column overflow-auto"
                        style={{height: "calc(100vh - 150px)"}}
                      >
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
                          <div className="flex-fill d-flex justify-content-center align-items-center overflow-auto">
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

