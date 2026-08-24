import { ListDevices } from "@/app/actions/devices-actions";
import DevicesTableClient from "@/components/devices/DevicesTableClient";
import DevicesInfoOne from "./DevicesInfoOne";

export default async function ListAllDevices({
    id,
    page = "1",
    limit = "20",
    search = "",
    type,
    status,
    idEmployee,
    idDepartment,
    idBranch
}: {
    id: string;
    page?: string;
    limit?: string;
    search?: string;
    type?: string;
    status?: string;
    idEmployee?: string;
    idDepartment?: string;
    idBranch?: string;
}) {
    if (id && id !== "null") {
        
        return (
            <DevicesInfoOne id={id} />
        );
    }
    
    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 2, 1), 100);

    const [devices] = await Promise.all([
        ListDevices({
            page: pageParse,
            limit: limitParse,
            search,
            type,
            status,
            idEmployee,
            idDepartment,
            idBranch,
        }),
    ]);

    return (
        <DevicesTableClient
            total={devices.total}
            page={pageParse}
            limit={limitParse}
            devices={devices.data}
            search={search}
            type={type}
            status={status}
            idEmployee={idEmployee}
            idDepartment={idDepartment}
            idBranch={idBranch}
        />
    );
}
