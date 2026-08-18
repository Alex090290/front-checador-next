import AttendanceTable from "@/components/attendanceReportComponents/TableList";
import AttendanceFiltersBar from "@/components/attendanceReportComponents/AttendanceFiltersBar";
import { fetchEventosReports } from "@/app/actions/eventos-actions";
import { listPeriodsForYear } from "@/app/actions/periods-actions";
import { Container } from "react-bootstrap";

export default async function ListAttendanceAll({
  id = 'null',
  page = "1",
  limit = "20",
  year,
}: {
  id: string;
  page?: string;
  limit?: string;
  year?: string;
}) {


  const nowYear = String(new Date().getFullYear());
  const yearSelected = year ?? nowYear;

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

  const periodsList = await listPeriodsForYear({ year: yearSelected });

  const idPeriod = id && id !== "null" ? Number(id) : 0;

  const listAttendance = idPeriod > 0
    ? await fetchEventosReports({ idPeriod, page: pageParse, limit: limitParse })
    : { data: [], total: 0 };


  return (
    <>
      <Container className="aling-items-center" style={{ maxWidth: "1600px" }}>
        <div className="mb-2">
          <AttendanceFiltersBar
            yearInitial={yearSelected}
            periodInitial={id}
            periods={periodsList ?? []}
            limit={limitParse}
            basePath="/app/attendanceReport" 
          />
        </div>

        <AttendanceTable
          id={id}
          data={listAttendance.data}
          total={listAttendance.total}
          page={pageParse}
          limit={limitParse}
          year={String(year)}
        />
      </Container>
    </>
  );
}
