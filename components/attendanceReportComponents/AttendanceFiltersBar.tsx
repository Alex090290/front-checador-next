"use client";

import { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
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

  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = 2000; y <= currentYear; y++) arr.push(y);
    return arr;
  }, [currentYear]);

  const [year, setYear] = useState<string>(yearInitial);
  const [periodId, setPeriodId] = useState<string>(periodInitial ?? "null");

  const pushParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(sp.toString());
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
    <div className="d-flex flex-wrap gap-2 align-items-end">
      <Form.Group>
        <Form.Label className="small text-muted m-0">Año</Form.Label>
        <Form.Select value={year} onChange={(e) => handleYearChange(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label className="small text-muted m-0">Periodo</Form.Label>
        <Form.Select
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          disabled={!periods || periods.length === 0}
        >
          <option value="null">Selecciona un periodo</option>
          {periods.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.description} (#{p.numberPeriod})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button
        type="button"
        className="fw-semibold d-inline-flex align-items-center gap-2"
        onClick={handleSearch}
        disabled={periodId === "null"}
      >
        <i className="bi bi-search" />
        Buscar
      </Button>
    </div>
  );
}
