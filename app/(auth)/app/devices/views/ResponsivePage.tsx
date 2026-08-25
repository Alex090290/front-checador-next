import { ListOneDevice } from "@/app/actions/devices-actions";
import ResposiveDoc from "@/components/devices/ResposiveDoc";

export default async function ResponsivePage({ id }: { id: string }) {
    const res = await ListOneDevice({ id: Number(id) });

    if (!res) {
        return <div className="text-center py-5">Dispositivo no encontrado.</div>;
    }

    return <ResposiveDoc device={res} idDevice={res.id} />;
}