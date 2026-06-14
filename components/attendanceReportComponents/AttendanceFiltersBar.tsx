"use client";

import { useMemo, useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";

type Period = {
  id: number;
  year: string;
  numberPeriod: number;
  description: string;
  dateInit: string;
  dateEnd: string;
};

export default function AttendanceFiltersBar({
  yearInitial,
  periodInitial,
  periods,
  limit,
  basePath = "/app/attendanceReport", // ajusta a tu ruta real
}: {
  yearInitial: string;
  periodInitial: string; // "null" | "2"
  periods: Period[];
  limit: number;
  basePath?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = 2000; y <= currentYear; y++) arr.push(y);
    return arr;
  }, [currentYear]);

  const [year, setYear] = useState<string>(yearInitial);
  const [periodId, setPeriodId] = useState<string>(periodInitial ?? "null");

  const pushParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsString);
    Object.entries(next).forEach(([k, v]) => params.set(k, v));
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleYearChange = (nextYear: string) => {
    setYear(nextYear);
    setPeriodId("null");

    // ✅ Al cambiar año: recargar periodos en server
    pushParams({
      year: nextYear,
      id: "null",
      page: "1",
      limit: String(limit),
      view_type: "list",
    });
  };

  const handleSearch = () => {
    if (!periodId || periodId === "null") return;

    // ✅ Buscar: el server ya hará fetchEventosReports con ese idPeriod
    pushParams({
      year,
      id: periodId,
      page: "1",
      limit: String(limit),
      view_type: "list",
    });
  };

  return (
    <Row className="g-3 mt-2 ms-2 mb-4 ">
      <Col xs={12} md={4} lg={3}>
        <Form.Label className="fw-semibold">Año</Form.Label>

        <InputGroup>
          <InputGroup.Text
            className="bg-gray"
            style={{ color: "#6c757d" }}
          >
            <i className="bi bi-calendar3" />
          </InputGroup.Text>

          <Form.Select
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </Col>

      <Col xs={12} md={5} lg={4}>
        <Form.Label className="fw-semibold">Periodo</Form.Label>

        <InputGroup>
          <InputGroup.Text
            className="bg-gray"
            style={{ color: "#6c757d" }}
          >
            <i className="bi bi-calendar-week" />
          </InputGroup.Text>

          <Form.Select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            disabled={!periods?.length}
          >
            <option value="null">Selecciona un periodo</option>

            {periods.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.description} (#{p.numberPeriod})
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </Col>

      <Col xs={12} md="auto" className="d-flex align-items-end">
        <Button
          onClick={handleSearch}
          disabled={periodId === "null"}
          className="d-inline-flex align-items-center gap-2 fw-semibold"
        >
          <i className="bi bi-search" />
          Buscar
        </Button>
      </Col>
    </Row>
  );
}
