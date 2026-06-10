"use client"

import { useEffect, useState } from "react";
import { Badge, Card, Col, Spinner } from "react-bootstrap";
import Image from "next/image";
import { fetchSignatureOverTime } from "@/app/actions/overtime-actions";


function SignaturesViewOvertime({
    id,
    idEmployee,
    name,
}: {
    id: number | null;
    idEmployee: string | null;
    name: string;
    url?: string;
}){
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

useEffect(() => {
    const handleFetchSignature = async () => {
      if (!id || !idEmployee) return;
      setLoading(true);
      const res = await fetchSignatureOverTime({ id, idEmployee});
      if (!res.success) return setLoading(false);
      setImgUrl(res.data || null);
      setLoading(false);
    };
    handleFetchSignature();
  }, [id, idEmployee]);

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

export default SignaturesViewOvertime;
