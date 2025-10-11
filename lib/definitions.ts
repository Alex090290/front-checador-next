import { PhoneNumberFormat } from "./sinitizePhone";

export interface ActionResponse<T> {
  success: boolean | number;
  message: string;
  data?: T;
}

export interface ApiResponse<T> {
  message: string;
  status: number;
  data: T;
}

export interface User {
  _id: string;
  id: number;
  name: string;
  lastName: string;
  email: string;
  gender: string;
  status: 1 | 2 | 3;
  role: UserRole;
  permissions: Permission[];
  phone: PhoneNumberFormat;
  createdAt: string;
}

export type DisplayType = {
  admin: string;
  employee: string;
};

export type Permission = {
  id: number | null;
  text: string;
};

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "LEADER"
  | "EMPLOYEE"
  | "CHECADOR";

export interface Department {
  _id?: string;
  id?: number;
  nameDepartment: string;
  description: string;
  idLeader: number | null;
  positions: Position[];
  cretedAt?: string;
}

export interface Position {
  _id?: string;
  id?: number;
  namePosition: string;
  idDepartment: number;
  cretedAt?: string;
}

export interface Branch {
  _id?: string;
  id?: number;
  name: string;
  idManager?: number | null;
  address?: BranchAddress;
  coordinates?: {
    lat: number | null;
    lng: number | null;
  };
  lat?: number | null;
  lng?: number | null;
  country?: string;
  municipality?: string;
  state?: string;
  street?: string;
  numberOut?: string;
  numberIn?: string | null;
  zipCode?: number;
  neighborhood?: string;
}

type BranchAddress = {
  country: string;
  municipality: string;
  state: string;
  street: string;
  numberOut: string;
  numberIn: string | null;
  zipCode: number;
  neighborhood: string;
  coordinates?: {
    lat: number | null;
    lng: number | null;
  };
};

export interface Employee {
  _id?: string;
  id?: number;
  name: string | null;
  lastName: string | null;
  phonePersonal: PhoneNumberFormat | null;
  emailPersonal: string | null;
  idCheck: number | null;
  passwordCheck: string | null;
  entryOffice: string | null;
  exitOffice: string | null;
  entryLunch: string | null;
  exitLunch: string | null;
  idDepartment: number | null;
  department?: Department;
  idPosition: number | null;
  position?: Position;
  branch: Branch | null;
  gender: "HOMBRE" | "MUJER";
  scheduleOffice?: {
    entry: string;
    exit: string;
  };
  scheduleLunch?: {
    entry: string;
    exit: string;
  };
  status?: 1 | 2 | 3;
  role?: UserRole;
  leader?: Employee | null;
}

export interface ModalBasicProps {
  show: boolean;
  onHide: () => void;
  action?: () => void;
  string?: string;
  title?: string;
}
