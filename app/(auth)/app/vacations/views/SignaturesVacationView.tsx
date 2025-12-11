"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge, Card, Col, Spinner } from "react-bootstrap";
import { VacationRequestStatus } from "@/lib/definitions";
import { vacationStatus } from "./VacationsListView";
import { fetchVacationSignature } from "@/app/actions/vacations-actions";

function SignaturesVacationView({
  idSolicitud,
  idPeriod,
  idEmployee,
  name,
  status,
}: {
  idSolicitud: number | null;
  idPeriod: number | null;
  idEmployee: number | null;
  name: string;
  status: VacationRequestStatus;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // const handleFetchSignature = async () => {
  //   if (!idSolicitud || !idEmployee) return;
  //   setLoading(true);
  //   const res = await fetchVacationSignature({
  //     data: { idSolicitud, idPeriod, idEmployee },
  //   });
  //   if (!res.success) return setLoading(false);
  //   setImgUrl(res.data || null);
  //   setLoading(false);
  // };

  useEffect(() => {
    const handleFetchSignature = async () => {
      if (!idSolicitud || !idEmployee) return;
      setLoading(true);
      const res = await fetchVacationSignature({
        data: { idSolicitud, idPeriod, idEmployee },
      });
      if (!res.success) return setLoading(false);
      setImgUrl(res.data || null);
      setLoading(false);
    };
    handleFetchSignature();
  }, [idSolicitud, idEmployee, idPeriod]);

  return (
    <Col md="4">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <Badge
              bg={
                status === "APPROVED"
                  ? "success"
                  : status === "PENDING"
                  ? "warning"
                  : "secondary"
              }
            >
              {vacationStatus[status ?? "EMPLOYEE"]}
            </Badge>
            {/* {dateApproved ? formatDate(dateApproved, "dd-MM-yyyy HH:mm") : null} */}
          </div>
        </Card.Header>
        <Card.Body className="p-1 text-center">
          {loading ? (
            <Spinner size="sm" animation="border" />
          ) : (
            <Image
              unoptimized
              src={imgUrl ?? "/image/avatar_default.svg"}
              alt="signature"
              width={300}
              height={100}
            />
          )}
        </Card.Body>
        <Card.Footer className="text-center text-capitalize fw-semibold">
          {name}
        </Card.Footer>
      </Card>
    </Col>
  );
}

export default SignaturesVacationView;
