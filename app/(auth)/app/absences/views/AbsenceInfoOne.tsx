import { findAbsence } from "@/app/actions/absences-actions";
import { AbsenceOne } from "@/components/absences/AbsenceInfoOne";

export default async function OverTimeInfoOne ({ id }: { id: string }) {
    
    const [absence] = await Promise.all([
        findAbsence({ id: Number(id) })
    ]);

    return <AbsenceOne absence={absence!}/>;
}