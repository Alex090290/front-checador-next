"use client";

import { fetchSignature } from "@/app/actions/permissions-actions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, Col } from "react-bootstrap";

function SignaturesView({
  idPermission,
  idEmployee,
  name,
}: {
  idPermission: string | null;
  idEmployee: string | null;
  name: string;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const handleFetchSignature = async () => {
    if (!idPermission || !idEmployee) return;
    const res = await fetchSignature({ idEmployee, idPermission });
    if (!res.success) return;
    setImgUrl(res.data || null);
  };

  useEffect(() => {
    handleFetchSignature();
  }, []);

  return (
    <Col md="4">
      <Card>
        <Card.Body className="p-1 text-center">
          <Image
            unoptimized
            src={imgUrl ?? "/image/avatar_default.svg"}
            alt="signature"
            width={300}
            height={100}
          />
        </Card.Body>
        <Card.Footer className="text-center text-capitalize fw-semibold">
          {name}
        </Card.Footer>
      </Card>
    </Col>
  );
}

export default SignaturesView;
