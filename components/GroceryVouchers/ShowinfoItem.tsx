import { IGroceryVouchers } from "@/lib/groceryVouchers/interface"
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import OverLay from "../templates/OverLay";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ICurrentPeriod } from "@/lib/definitions";
import moment from "moment";

type FeedbackState = "loading" | "success" | "error" | null;

moment.locale("es");

const money = (n: number | null | undefined) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(n ?? 0));

// utc() evita que una fecha ISO a medianoche se muestre un día antes en México (UTC-6)
const fmtDate = (d?: string | null, f = "ddd D MMM YYYY") =>
    d ? moment.utc(d).format(f) : "—";

function StatBox({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
    return (
        <div className="border rounded-4 p-3 h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-3">
                <div
                    className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 bg-${accent}-subtle text-${accent}-emphasis`}
                    style={{ width: 44, height: 44 }}
                >
                    <i className={`bi bi-${icon} fs-5`} />
                </div>
                <span className="text-muted small fw-semibold text-uppercase">{label}</span>
            </div>
            <div className={`fw-bold lh-1 text-${accent}-emphasis`} style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)" }}>
                {value}
            </div>
        </div>
    );
}

function SectionHeader({ icon, title, count }: { icon: string; title: string; count: number }) {
    return (
        <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
                <i className={`bi bi-${icon} text-primary`} />
                <span className="fw-semibold">{title}</span>
            </div>
            <span className="badge rounded-pill px-3 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                {count}
            </span>
        </div>
    );
}

function EmptyRow({ colSpan, icon, text }: { colSpan: number; icon: string; text: string }) {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-4 text-muted">
                <i className={`bi bi-${icon} d-block mb-2`} style={{ fontSize: "2rem" }} />
                <span className="fw-semibold small">{text}</span>
            </td>
        </tr>
    );
}


export default function ShowinfoItemGroceryVouchers({
    data,
    period,
    onBack
}: {
    data: IGroceryVouchers | null;
    period: ICurrentPeriod | undefined;
    onBack: () => void;
}) {


    //CONST
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    const discounts = data?.dailyBreakdownDiscount ?? [];
    const pendingDays = data?.daysPendingVerification ?? [];
    const pendingCount = pendingDays.filter((d) => !d.verified).length;

    console.log("verificados:", data?.daysPendingVerification);
    

    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg} />
            </ConditionalRender>

            <Container className="py-3 overflow-x: auto" style={{ maxWidth: "1600px" }}>

                <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-3">

                    <div className=" d-md-flex flex-wrap">
                        <Button
                            variant="outline-secondary"
                            onClick={onBack}
                            className="d-inline-flex align-items-center gap-2 fw-semibold px-2 px-md-3"
                        >
                            <i className="bi bi-arrow-left" />
                            Regresar
                        </Button>
                    </div>
                </div>

                <div>
                    <h1 className="mb-1 ms-1 text-uppercase">{data?.lastName} {data?.name}</h1>
                    <p className="text-muted mb-0 ms-1">
                        Información del registro de vales del periodo <strong className="text-info fs-5">"{period?.numberPeriod}"</strong>.
                    </p>
                </div>

                <Card className="rounded-4 shadow-sm border mt-2">
                    <Card.Body className="p-4 p-md-5">
                        {/* RESUMEN */}
                        <Row className="g-3 mb-4">
                            <Col xs={12} md={4}>
                                {/* <StatBox icon="cash-stack" label="Monto bruto" value={money(data?.sumPaymentPositive)} accent="success" /> */}
                                <StatBox icon="cash-stack" label="Monto bruto" value="$540.00 MXN" accent="success" />
                            </Col>
                            <Col xs={12} md={4}>
                                <StatBox icon="dash-circle" label="Descuentos" value={`- ${money(data?.totalDiscount)} MXN`} accent="danger" />
                            </Col>
                            <Col xs={12} md={4}>
                                <StatBox icon="wallet2" label="Total a pagar" value={`${money(data?.amountPaymentTotal)} MXN`} accent="primary" />
                            </Col>
                        </Row>

                        <Row className="g-3">
                            {/* DESCUENTOS */}
                            <Col xs={12} xl={7}>
                                <div className="border rounded-4 p-3 h-100">
                                    <SectionHeader icon="receipt-cutoff" title="Detalle de descuentos" count={discounts.length} />

                                    <div className="table-responsive rounded-3 border">
                                        <table className="table table-hover align-middle mb-0 small">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Categoría</th>
                                                    <th>Motivo</th>
                                                    <th className="text-end">Descuento</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <ConditionalRender cond={discounts.length === 0}>
                                                    <EmptyRow colSpan={4} icon="emoji-smile" text="Sin descuentos en este periodo" />
                                                </ConditionalRender>

                                                {discounts.map((d) => (
                                                    <tr key={d._id ?? d.id}>
                                                        <td className="text-capitalize text-nowrap">{fmtDate(d.dateOfAbsence)}</td>
                                                        <td>
                                                            <div className="fw-semibold text-uppercase">{d.category}</div>
                                                            <div className="text-muted">{d.subCategory}</div>
                                                            <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle mt-1">
                                                                {d.type}
                                                            </span>
                                                        </td>
                                                        <td className="text-muted" style={{ maxWidth: 240 }}>
                                                            {d.motiveJustify || "—"}
                                                        </td>
                                                        <td className="text-end fw-semibold text-danger text-nowrap">
                                                            - {money(d.discount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Col>

                            {/* DÍAS POR VERIFICAR */}
                            <Col xs={12} xl={5}>
                                <div className="border rounded-4 p-3 h-100">
                                    <SectionHeader icon="calendar-check" title="Días pagados por adelantado" count={pendingDays.length} />

                                    <ConditionalRender cond={pendingCount > 0}>
                                        <div className="alert alert-warning rounded-3 py-2 small d-flex align-items-center gap-2">
                                            <i className="bi bi-hourglass-split" />
                                            {pendingCount} día{pendingCount !== 1 ? "s" : ""} pendiente{pendingCount !== 1 ? "s" : ""} de verificación
                                        </div>
                                    </ConditionalRender>

                                    <div className="table-responsive rounded-3 border" style={{ maxHeight: 420, overflowY: "auto" }}>
                                        <table className="table table-hover align-middle mb-0 small">
                                            <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Estado</th>
                                                    <th className="text-end">Pago</th>
                                                    <th className="text-end">Desc.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <ConditionalRender cond={pendingDays.length === 0}>
                                                    <EmptyRow colSpan={4} icon="inbox" text="Sin días registrados" />
                                                </ConditionalRender>

                                                {pendingDays.map((d) => (
                                                    <tr key={d.date}>
                                                        <td className="text-capitalize text-nowrap">{fmtDate(d.date, "ddd D MMM")}</td>
                                                        <td>
                                                            <ConditionalRender cond={d.verified}> 
                                                                <span className="badge rounded-pill px-2 py-1 bg-success-subtle text-success-emphasis border border-success-subtle">
                                                                    <i className="bi bi-check-circle me-1" />Verificado
                                                                </span>
                                                            </ConditionalRender>

                                                            <ConditionalRender cond={!d.verified}> 
                                                                <span className="badge rounded-pill px-2 py-1 bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                                                    <i className="bi bi-hourglass-split me-1" />Pendiente
                                                                </span>
                                                            </ConditionalRender>
                                                        </td>
                                                        <td className="text-end text-nowrap">{money(d.amountPayment)}</td>
                                                        <td className={`text-end text-nowrap ${d.discountAmount ? "text-danger fw-semibold" : "text-muted"}`}>
                                                            {d.discountAmount ? `- ${money(d.discountAmount)}` : "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}
