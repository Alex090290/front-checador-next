import { ListDevices } from "@/app/actions/devices-actions";
import CreateDeviceComponent from "@/components/devices/CreateDevices";

export default async function CreateDevicesPage() {

    const [devices] = await Promise.all([
        ListDevices({page: 1, limit: 500})
    ]);

    return (
        <>
            <CreateDeviceComponent
                devices={devices.data}
            />
        </>
    )
}
