import { fetchGroceryVouchers } from "@/app/actions/groceryVouchers-actios";
import { getCurrentPeriod, listPeriodsForYear } from "@/app/actions/periods-actions";
import GroceryVouchersTableClient from "@/components/GroceryVouchers/GroceryVouchersTableClient";

export default async function ListAllGroceryVouchers({
    year = "",
    search = "",
    page = "1",
    limit = "20",
    idPeriod
}: {
    year?: string;
    search?: string;
    page?: string;
    limit?: string;
    idPeriod?: string;
}) {

    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);


    const nowYear = String(new Date().getFullYear());
    const yearSelected = year || nowYear;

    const periodoActual = await getCurrentPeriod();
    const idPeriodSelected = idPeriod || String(periodoActual?.id ?? "");

    const [goceryVouchers, periodsList] = await Promise.all([
        fetchGroceryVouchers({
            idPeriod: idPeriodSelected,
            search,
            page: pageParse,
            limit: limitParse,
        }),
        listPeriodsForYear({ year: yearSelected })
    ])

    const sortedPeriods = [...(periodsList ?? [])].sort(
        (a, b) => Number(a.numberPeriod) - Number(b.numberPeriod)
    );

    return (
        <GroceryVouchersTableClient
            groceryVouchers={goceryVouchers.data}
            periods={sortedPeriods}
            periodoActual={periodoActual}
            idPeriodSelected={Number(idPeriodSelected)}
            search={search}
            page={pageParse}
            limit={limitParse}
            total={goceryVouchers.total}
        />
    )
}