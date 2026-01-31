import AttendanceTable from "@/components/attendanceReportComponents/TableList";
import { fetchEventosReports } from "@/app/actions/eventos-actions";

export default async function ListAttendanceAll({
  id,
  page = "1",
  limit = "20",
}: {
  id: string;
  page?: string;
  limit?: string;
}) {


  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

  const listAttendance = await fetchEventosReports({ idPeriod: Number(id), page: pageParse, limit: limitParse });

  console.log("listAttendance: ",listAttendance);
  
  return (
    <AttendanceTable
      id={id}
      data={listAttendance.data}
      total={listAttendance.total}
      page={pageParse}
      limit={limitParse}
    />
  );
}
