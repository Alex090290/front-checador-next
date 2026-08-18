import { ListOneDevice } from "@/app/actions/devices-actions";
import { DeviceOne } from "@/components/devices/DevicesInfoOne";

export default async function DeviceInfoOne ({ id }: { id: string }) {
    
    const [device] = await Promise.all([
        ListOneDevice({ id: Number(id) })
    ]);

    return <DeviceOne device={device!}/>;
}