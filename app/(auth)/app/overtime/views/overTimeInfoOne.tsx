import { getConfigSystem } from "@/app/actions/configSystem-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { findOvertimeById } from "@/app/actions/overtime-actions";
import { OvertimeOne } from "@/components/overtime/overtimeInfoOne";

export default async function OverTimeInfoOne ({ id }: { id: string }) {
    
    const [overtime, departments, configSystem] = await Promise.all([
        findOvertimeById({ id: Number(id) }),
        fetchDepartments(),
        getConfigSystem()
    ]);

    return <OvertimeOne overtime={overtime} departments={departments} connfigSystem={configSystem}/>;
}