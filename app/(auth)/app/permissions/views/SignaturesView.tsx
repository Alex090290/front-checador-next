"use client";

import { fetchSignature } from "@/app/actions/permissions-actions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, Col } from "react-bootstrap";
import { PermissionRequestStatus } from "@/lib/definitions";

function SignaturesView({
  idPermission,
  idEmployee,
  name,
  status,
  label,
}: {
  idPermission: string | null;
  idEmployee: string | null;
  name: string;
  dateApproved?: string;
  dateApprove?: string;
  dateApproveDoh?: string;
  status: PermissionRequestStatus;
  label?: string;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loadingSignature, setLoadingSignature] = useState(true);  

 useEffect(() => {
    const handleFetchSignature = async () => {
      if (!idPermission || !idEmployee) {
        setLoadingSignature(false);
        return;
      }

      try {
        setLoadingSignature(true);

        const res = await fetchSignature({ idPermission, idEmployee });

        if (res.success && res.data) {
          setImgUrl(res.data);
        } else {
          setImgUrl(null);
        }
      } finally {
        setLoadingSignature(false);
      }
    };

    handleFetchSignature();
  }, [idPermission, idEmployee]);

  // useEffect(() => {
  //   const handleFetchSignature = async () => {
  //     if (!idPermission || !idEmployee) return;
  //     setLoading(true);
  //     const res = await fetchSignature({ idEmployee, idPermission });
  //     if (!res.success) return setLoading(false);
  //     setImgUrl(res.data || null);
  //     setLoading(false);
  //   };
  //   handleFetchSignature();
  // }, [idPermission, idEmployee]);

   const hasSigned = Boolean(imgUrl);

  const getBadge = () => {
    const normalizedLabel = label
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const normalizedStatus = status?.toUpperCase();   

    if (normalizedLabel === "empleado") {
      return hasSigned
        ? { text: "Firmado", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle" }
        : { text: "Pendiente de firma", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle" };
    }

    if (normalizedLabel === "lider" || normalizedLabel === "direccion") {
      if (normalizedStatus === "APPROVED") {
        return { text: "Aprobado", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle" };
      }

      if (normalizedStatus === "REFUSED") {
        return { text: "Rechazado", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle" };
      }
      if (normalizedStatus === "PENDING") {
        return { text: "Pendiente de aprobar", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle" };
      }
  }
  
  if (normalizedLabel === "doh") {
    return hasSigned
      ? { text: "Enterado", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle" }
      : { text: "Pendiente", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle" };
  }

  return hasSigned
    ? { text: "Firmado", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle" }
    : { text: "Pendiente", bg: "bandge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle" };
};

const badge = getBadge();

 return (
   <Col md={4}>
     <Card className="mt-2">
       <Card.Header className="position-relative bg-dark text-white pt-4">
         <span
           className={`badge ${loadingSignature ? "bg-secondary" : badge.bg} position-absolute top-0 end-0 m-2`}
           style={{ minWidth: "120px" }}
         >
           {loadingSignature ? (
             <>
               <span
                 className="spinner-border spinner-border-sm me-2"
                 role="status"
                 aria-hidden="true"
               />
               Cargando...
             </>
           ) : (
             badge.text
           )}
         </span>
 
         <div className="fw-bold text-center text-uppercase">
           {label}
         </div>
       </Card.Header>
 
       <Card.Body className="p-1 text-center">
         {loadingSignature ? (
           <div
             className="d-flex justify-content-center align-items-center"
             style={{ height: "150px" }}
           >
             <div
               className="spinner-border text-primary"
               role="status"
             >
               <span className="visually-hidden">Cargando...</span>
             </div>
           </div>
         ) : (
           <Image
             unoptimized
             src={imgUrl ?? "/image/avatar_default.svg"}
             alt="signature"
             width={300}
             height={150}
           />
         )}
       </Card.Body>
 
       <Card.Footer className="text-center text-capitalize fw-semibold">
         <div className="text-uppercase">{name}</div>
       </Card.Footer>
     </Card>
   </Col >
 );
}

export default SignaturesView;
