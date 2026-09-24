import { getCurrentPeriod, listPeriodsForYear } from "@/app/actions/periods-actions";
import DashboardViewClient from "@/components/dashboard/dashboardViewClient";

async function DashboardView({
    idPeriod = "",
    year = "",
}: {
    idPeriod?: string;
    year?: string;
}) {

    const nowYear = String(new Date().getFullYear());
    const yearSelected = year || nowYear;

    const periodoActual = await getCurrentPeriod();
    const idPeriodSelected = idPeriod || String(periodoActual?.id ?? "");

    const periodsList = await listPeriodsForYear({ year: yearSelected });


    const sortedPeriods = [...(periodsList ?? [])].sort(
        (a, b) => Number(a.numberPeriod) - Number(b.numberPeriod)
    );

    return (
        <>
            <DashboardViewClient
                periods={sortedPeriods}
                periodoActual={periodoActual}
            />
        </>
    )
}

export default DashboardView