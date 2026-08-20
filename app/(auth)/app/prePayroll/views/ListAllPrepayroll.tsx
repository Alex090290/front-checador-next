import { getCurrentPeriod, listPeriodsForYear } from "@/app/actions/periods-actions";
import { listPrePayroll } from "@/app/actions/prePayroll-actions";
import PrePayrollTableClient from "@/components/prePayroll/PrePayrollTableClient";

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

    const [periodsList, periodoActual, prepayroll] = await Promise.all([
        listPeriodsForYear({ year: yearSelected }),
        getCurrentPeriod(),
        listPrePayroll({
            page: pageParse,
            limit: limitParse,
            search,
            idPeriod,
            year
        })
    ]);

    return (
        <PrePayrollTableClient
            total={prepayroll.total}
            page={pageParse}
            limit={limitParse}
            prepayroll={prepayroll.data}
            periods={periodsList ?? []}
            periodoActual={periodoActual}
            prepayrollextra={prepayroll.dataExtra}
        />
    );
}
