import { ListDevices } from "@/app/actions/devices-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import CreateDeviceComponent from "@/components/devices/CreateDevices";

export default async function CreateDevicesPage() {

    const [devices, employees] = await Promise.all([
        ListDevices({ page: 1, limit: 500 }),
        fetchEmployees({ page: 1, limit: 500 }),
    ]);

    return (
        <>
            <CreateDeviceComponent
                devices={devices.data}
                employees={employees.data}
            />
        </>
    )
}
