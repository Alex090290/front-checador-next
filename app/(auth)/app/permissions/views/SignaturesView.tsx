"use client";

import { fetchSignature } from "@/app/actions/permissions-actions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, Col, Spinner } from "react-bootstrap";

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
  const [loading, setLoading] = useState(false);

  const handleFetchSignature = async () => {
    if (!idPermission || !idEmployee) return;
    setLoading(true);
    const res = await fetchSignature({ idEmployee, idPermission });
    if (!res.success) return setLoading(false);
    setImgUrl(res.data || null);
    setLoading(false);
  };

  useEffect(() => {
    handleFetchSignature();
  }, []);

  return (
    <Col md="4">
      <Card>
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

export default SignaturesView;
