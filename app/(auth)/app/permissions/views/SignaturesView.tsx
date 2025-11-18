"use client";

import { fetchSignature } from "@/app/actions/permissions-actions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge, Card, Col, Spinner } from "react-bootstrap";
import { leaderApproval } from "./PermissionsListView";
import { PermissionRequestStatus } from "@/lib/definitions";
import { formatDate } from "date-fns";

function SignaturesView({
  idPermission,
  idEmployee,
  name,
  dateApproved,
  status,
}: {
  idPermission: string | null;
  idEmployee: string | null;
  name: string;
  dateApproved?: string;
  dateApprove?: string;
  dateApproveDoh?: string;
  status: PermissionRequestStatus;
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
    console.log(status);
  }, []);

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
              {leaderApproval[status ?? "EMPLOYEE"]}
            </Badge>
            {dateApproved ? formatDate(dateApproved, "dd-MM-yyyy HH:mm") : null}
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

export default SignaturesView;
