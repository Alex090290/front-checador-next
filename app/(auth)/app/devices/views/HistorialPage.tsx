import { ListOneDevice } from "@/app/actions/devices-actions";
import DevicesOneError from "@/components/devices/DevicesOneError";
import HistorialDevice from "@/components/devices/HistorialDevice";

export default async function HistorialPage({ id }: { id: string }) {
    const res = await ListOneDevice({ id: Number(id) });

    if (!res) {
        return(
            <DevicesOneError/>
        );
    }

    return <HistorialDevice device={res} idDevice={res.id} />;
}