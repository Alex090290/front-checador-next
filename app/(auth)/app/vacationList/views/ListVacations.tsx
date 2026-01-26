import { fetchVacations } from "@/app/actions/vacations-actions";
import VacationsTableClient from "../../../../../components/vacations/VacationsTableClient";
import VacationsInfoOne from "./InfoOneVacation";

export default async function ListVacationsAll({
  id,
  page = "1",
  limit = "20",
}: {
  id: string;
  page?: string;
  limit?: string;
}) {

    if (id && id !== "null") {
    return <VacationsInfoOne id={id} />;
  }

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

  const vacationsPaged = await fetchVacations({ page: pageParse, limit: limitParse });

  return (
    <VacationsTableClient
      id={id}
      vacations={vacationsPaged.data}
      total={vacationsPaged.total}
      page={pageParse}
      limit={limitParse}
    />
  );
}
