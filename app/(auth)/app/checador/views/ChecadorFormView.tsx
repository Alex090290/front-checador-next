"use client";

import { checkIn, fetchCheckInFeedback } from "@/app/actions/entry-actions";
import ChecadorEntryForm from "@/components/forms/ChecadorEntryForm";
import Clock from "@/components/top-nav/Clock";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "date-fns";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { formatDatelocal } from "@/lib/helpers";
import toast from "react-hot-toast";
import { ActionResponse } from "@/lib/definitions";
import useSWR from "swr";
import Image from "next/image";

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

function ChecadorFormView() {
  const { data: activeNotice } = useSWR("/api/notice", fetcher);

  let toastId: string = "";

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [feedbackDisplay, setFeedbackDisplay] = useState<IFeedbackDisplay[]>(
    []
  );

  const [message, setMessage] = useState<string>("");

  const feedbackContainerRef = useRef<HTMLDivElement | null>(null);

  const receiveCheckData = async (
    data: TCheckData
  ): Promise<ActionResponse<string>> => {
    toastId = toast.loading("Enviando datos...", {
      position: "top-center",
    });
    const newObj = {
      ...data,
      lat: location?.lat || 0,
      lng: location?.lon || 0,
    };

    const res = await checkIn(newObj);
    if (!res.success) {
      toast.error(res.message, { id: toastId });
      return res;
    }

    setMessage(res?.data || "");

    handleFetchFeedback();

    return res;
  };

  const handleFetchFeedback = async () => {
    let toastLoading: string = "";
    if (toastId !== "") {
      toast.loading("Esperando respuesta...", { id: toastId });
    } else {
      toastLoading = toast.loading("Cargando registros...");
    }

    const res = await fetchCheckInFeedback();

    if (!res.success) {
      toast.error(res.message, { id: toastId });
      return;
    }

    const newFeedback: IFeedbackDisplay[] =
      res.data?.map((feed) => ({
        id: feed.checks.id,
        name: `${feed.employee.lastName} ${feed.employee.name}`,
        timestamp: formatDate(feed.checks.timestamp, "HH:mm"),
        department: feed.departmentEmployee.nameDepartment,
        position: feed.positionEmployee.namePosition,
        type: feed.checks.type,
      })) || [];

    setFeedbackDisplay(newFeedback);
    // toast.dismiss(toastId);

    if (toastId !== "") {
      toast.success("Registro completado...", { id: toastId });
    } else {
      toast.success("Se han cargado los registros...", { id: toastLoading });
    }
  };

  useEffect(() => {
    handleFetchFeedback();
  }, []);

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

  // 👇 Auto-scroll cuando cambia feedbackDisplay
  useEffect(() => {
    if (feedbackContainerRef.current) {
      feedbackContainerRef.current.scrollTo({
        top: feedbackContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [feedbackDisplay]);

  console.log(activeNotice);

  return (
    <Row className="h-100 overflow-auto">
      <Col md="12" className="h-100">
        <Card className="d-flex flex-column shadow h-100 border-0">
          <Card.Header className="border-0">
            <h3 className="d-flex justify-content-between fw-bolder">
              <Button onClick={() => signOut()} variant="link">
                Salir
              </Button>
              <span className="shadow-sm px-2 rounded">
                {formatDatelocal(new Date())}
              </span>
            </h3>
            <Row>
              <Col md="6">
                <div className="row align-items-stretch">
                  <ChecadorEntryForm receiveCheckData={receiveCheckData} />
                  <div className="col-md-7 bg-body-tertiary">
                    <div>
                      <h2 className="text-center">{message}</h2>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md="6" className="text-center text-uppercase fw-semibold">
                <div style={{ fontSize: "4rem" }}>
                  <Clock />
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="flex-fill overflow-auto p-1">
            <Container fluid className="h-100">
              <Row className="h-100">
                <Col
                  md="6"
                  className="overflow-auto h-100 bg-body-tertiary px-0"
                  id="feedback-container"
                  ref={feedbackContainerRef} // 👈 Referencia al contenedor
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
                      <tr className="border-end border-bottom table-active sticky-top">
                        <th className="border-end">Nombre</th>
                        <th className="border-end">Hora</th>
                        <th className="border-end">Evento</th>
                        <th className="border-end">Departamento</th>
                        <th className="border-end">Puesto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbackDisplay.map((feed) => (
                        <tr key={feed.id} className="border-bottom">
                          <td className="text-nowrap">{feed.name}</td>
                          <td className="text-nowrap text-center fw-semibold">
                            {feed.timestamp}
                          </td>
                          <td className="text-nowrap">
                            {feed.type.replace(/_/g, " ").toUpperCase()}
                          </td>
                          <td className="text-nowrap">{feed.department}</td>
                          <td className="text-nowrap">{feed.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
                <Col md="6" className="h-100 px-1">
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column p-3 gap-3">
                      {activeNotice?.text && (
                        <Card.Title className="text-uppercase text-center fs-5 mb-0">
                          {activeNotice.text}
                        </Card.Title>
                      )}

                      {activeNotice?.img && (
                        <div className="flex-fill d-flex justify-content-center align-items-center">
                          <Image
                            src={activeNotice.img}
                            height={800}
                            width={850}
                            alt="NOTICE_img"
                            className="img-fluid h-100 w-auto object-fit-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default ChecadorFormView;
