"use client"

import { useEffect, useState } from "react";
import { Card, Col } from "react-bootstrap";
import Image from "next/image";
import { fetchSignatureOverTime } from "@/app/actions/overtime-actions";


function SignaturesViewOvertime({
  id,
  idEmployee,
  name,
  label,
  status,
}: {
  id: number | null;
  idEmployee: string | null;
  name: string;
  url?: string;
  label?: string;
  status?: string | null;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleFetchSignature = async () => {
      if (!id || !idEmployee) return;

      const res = await fetchSignatureOverTime({ id, idEmployee });

      if (!res.success) return;

      setImgUrl(res.data || null);
    };

    handleFetchSignature();
  }, [id, idEmployee]);

  const hasSigned = Boolean(imgUrl);

  const getBadge = () => {
    const normalizedLabel = label
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const normalizedStatus = status?.toUpperCase();

    if (normalizedLabel === "empleado") {
      return hasSigned
        ? { text: "Firmado", bg: "success" }
        : { text: "Pendiente de firma", bg: "warning" };
    }

    if (normalizedLabel === "lider") {
      if (normalizedStatus === "APPROVED") {
        return { text: "Aprobado", bg: "success" };
      }

      if (normalizedStatus === "REFUSED") {
        return { text: "Rechazado", bg: "danger" };
      }

      return hasSigned
        ? { text: "Firmado", bg: "success" }
        : { text: "Pendiente de aprobación", bg: "warning" };
    }

    if (normalizedLabel === "doh") {
      return hasSigned
        ? { text: "Enterado", bg: "info" }
        : { text: "Pendiente", bg: "warning" };
    }

    return hasSigned
      ? { text: "Firmado", bg: "success" }
      : { text: "Pendiente", bg: "warning" };
  };

  const badge = getBadge();

  return (
    <Col md={4}>
      <Card className="mt-2">
        <Card.Header className="position-relative bg-dark text-white pt-4">

          <span
            className={`badge bg-${badge.bg} position-absolute top-0 end-0 m-2`}
          >
            {badge.text}
          </span>

          <div className="fw-bold text-center text-uppercase">
            {label}
          </div>

        </Card.Header>

        <Card.Body className="p-1 text-center">
          <Image
            unoptimized
            src={imgUrl ?? "/image/avatar_default.svg"}
            alt="signature"
            width={300}
            height={150}
          />
        </Card.Body>

        <Card.Footer className="text-center text-capitalize fw-semibold">
          <div>{name}</div>
        </Card.Footer>
      </Card>
    </Col>
  );
}

export default SignaturesViewOvertime;
