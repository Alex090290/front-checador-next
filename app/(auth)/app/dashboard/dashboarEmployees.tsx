import { findEmployeeById } from "@/app/actions/employee-actions";
import { showStatistics } from "@/app/actions/estadisticas-actions";
import { getCurrentPeriod, listPeriodsForYear } from "@/app/actions/periods-actions";
import DashboardViewEmployee from "@/components/dashboard/dasboardViewEmployee"
import { auth } from "@/lib/auth";

// dashboarEmployees.tsx
async function DashboardViewE({
    idPeriod = "",
    year = "",
}: {
    idPeriod?: string;
    year?: string;
}) {
    const session = await auth();
    const nowYear = String(new Date().getFullYear());
    const yearSelected = year || nowYear;

    const periodoActual = await getCurrentPeriod();
    const idPeriodSelected = idPeriod || String(periodoActual?.id ?? "");

    const [periodsList, statistics, getEmployee] = await Promise.all([
        listPeriodsForYear({ year: yearSelected }),
        showStatistics(yearSelected, idPeriodSelected),
        findEmployeeById({ id: session?.user?.idEmployee })
    ]);

    const sortedPeriods = [...(periodsList ?? [])].sort(
        (a, b) => Number(a.numberPeriod) - Number(b.numberPeriod)
    );

    return (
        <DashboardViewEmployee
            statistics={statistics.data}
            periods={sortedPeriods}
            periodoActual={periodoActual}
            employee={getEmployee}
        />
    );
}

export default DashboardViewE