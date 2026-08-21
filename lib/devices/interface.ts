import { ISignatures } from "../overTime/interface";

type DeviceType = "computadora" | "laptop" | "impresora" | "servidor" |
    "switch" | "router" | "telefono_ip" | "camara" |
    "access_point" | "celular" | "television" | "otro";

// type DeviceStatus = "activo" | "inactivo" | "en_reparacion" | "baja";

type OSType = "windows_10" | "windows_11" | "windows_server" | 
    "linux" | "macos" | "android" | "ios" | "otro" | null;

export interface IDevices {
    _id?: string;
    id: number;
    name: string;
    type: DeviceType | null;
    status: string | "activo";

    networkInfo: {
        id?: number;
        mac: string;
        ip: string;
        description: string;
        hostname: string;
        gateway: string;
        dns: string[];
        vlan: string;
        port: string;
    }[];

    specs?: {
        brand: string;
        model: string;
        serialNumber: string;
        processor: string;
        ram: string;
        storage: string;
        os: OSType | null;
        osVersion: string;
        purchaseDate: string;
        warrantyExpiration: string;
    }

    currentAssignment?: {
        id: number | null;
        idEmployee?: number | null;
        idBranch: number | null;
        idDepartment: number | null;
        location: string;
        signatures?: ISignatures[] | null;
        deliveryDocument?: string | null;
        documentReceived?: string | null;
        assignedAt: string | null;
        returnedAt?: string | null;
    }

    createdAt: string;
    updatedAt: string;

    employee?: {
        id: number;
        name: string;
        lastName: string;
    }

    department?: {
        id: number;
        nameDepartment: string;
    }

    branch?: {
        id: number;
        name: string;
    }

    idIt?: number | null;
    notes?: string;
}

export interface INetworkInfo {
    id: number;
    mac: string;
    ip: string;
    description: string;
    hostname: string;
    gateway: string;
    dns: string[];
    vlan: string;
    port: string;
}