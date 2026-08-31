import { fetchAbsencesQueries } from "@/app/actions/absences-actions";
import AbsencesTableClient from "@/components/absences/AbsencesTableClient";
import AbsenceInfoOne from "./AbsenceInfoOne";
import moment from "moment-timezone";

export default async function ListAllAbsences({
    id,
    page = "1",
    limit = "20",
    search = "",
    dateInit,
    dateEnd,
    type
}: {
    id: string;
    page?: string;
    limit?: string;
    search?: string;
    dateInit?: string;
    dateEnd?: string;
    type?: string;
}) {
    if (id && id !== "null") {
        return (
            <AbsenceInfoOne id={id} />
        );
    }
    const currentDate = moment.tz().format("YYYY-MM-DD");

    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 2, 1), 100);

    const finalDateInit = dateInit || currentDate;
    const finalDateEnd = dateEnd || currentDate;

    const [absence, faltasHoy] = await Promise.all([
        fetchAbsencesQueries({
            page: pageParse,
            limit: limitParse,
            search,
            dateInit: finalDateInit,
            dateEnd: finalDateEnd,
            type
        }),
        fetchAbsencesQueries({
            page: 1,
            limit: 1,
            dateInit: currentDate,
            dateEnd: currentDate,
            type: "falta"
        })
    ]);

    const yaGenerado = faltasHoy.total > 0;

    return (
        <AbsencesTableClient
            total={absence.total}
            page={pageParse}
            limit={limitParse}
            absence={absence.data}
            dateInit={finalDateInit}
            dateEnd={finalDateEnd}
            type={type}
            yaGenerado={yaGenerado}
        />
    );
}
