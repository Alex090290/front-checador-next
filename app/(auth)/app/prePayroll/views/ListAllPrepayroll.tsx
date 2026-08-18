import { fetchAbsencesQueries } from "@/app/actions/absences-actions";
import { getCurrentPeriod, listPeriodsForYear } from "@/app/actions/periods-actions";
import { listPrePayroll } from "@/app/actions/prePayroll-actions";
import AbsencesTableClient from "@/components/absences/AbsencesTableClient";
import PrePayrollTableClient from "@/components/prePayroll/PrePayrollTableClient";
import moment from "moment-timezone";

export default async function ListPrePayroll({
    page = "1",
    limit = "20",
    search = "",
    idPeriod = "",
    year
}: {
    id: string;
    page?: string;
    limit?: string;
    search?: string;
    idPeriod?: string;
    year?: string;
}) {

    const nowYear = String(new Date().getFullYear());
    const yearSelected = year ?? nowYear;

    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 2, 1), 100);


    const periodsList = await listPeriodsForYear({ year: yearSelected });

    const periodoActual = await getCurrentPeriod();
    

    const [prepayroll] = await Promise.all([
        listPrePayroll({
            page: pageParse,
            limit: limitParse,
            search,
            idPeriod,
            year
        }),
    ]);

    return (
        <PrePayrollTableClient
            total={prepayroll.total}
            page={pageParse}
            limit={limitParse}
            prepayroll={prepayroll.data}
            periods={periodsList ?? []}
            periodoActual={periodoActual}
        />
    );
}
