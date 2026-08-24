import { fetchBranches } from "@/app/actions/branches-actionst";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { ListOneDevice } from "@/app/actions/devices-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { DeviceOne } from "@/components/devices/DevicesInfoOne";

export default async function DeviceInfoOne({ id }: { id: string }) {

    const [device, employees, branches, departments] = await Promise.all([
        ListOneDevice({ id: Number(id) }),
        fetchEmployees({ page: 1, limit: 500 }),
        fetchBranches(),
        fetchDepartments(),
    ]);

    return <DeviceOne
        device={device!}
        employees={employees.data}
        branches={branches}
        departments={departments}
    />;
}