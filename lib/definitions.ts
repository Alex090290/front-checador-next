import { PhoneNumberFormat } from "./sinitizePhone";

export interface ActionResponse<T> {
  success: boolean;
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
  idEmployee: number | null;
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
  leader?: Employee | null;
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
  passwordSystem: string;
  entryOffice: string | null;
  entrySaturdayOffice: string | null;
  exitOffice: string | null;
  exitSaturdayOffice: string | null;
  entryLunch: string | null;
  exitLunch: string | null;
  idDepartment: number | null;
  department?: Department;
  idPosition: number | null;
  position?: Position;
  branch: Branch | null;
  gender: "MASCULINO" | "FEMENINO";
  scheduleOffice?: {
    entry: string;
    exit: string;
  };
  scheduleLunch?: {
    entry: string;
    exit: string;
  };
  scheduleSaturday?: {
    entry: string | null;
    exit: string | null;
  };
  status?: 1 | 2 | 3;
  role?: UserRole[];
  leader?: Employee | null;
  phoneCompany: PhoneNumberFormat | null;
  phoneExtCompany: number | 0;
  address: BranchAddress;
  emailCompany: string;
  scheduleDescription: string;
  policies: string;
  group: string;
  homePhone: PhoneNumberFormat;
  sons: number | 0;
  daughters: number | 0;
  birthDate: string;
  nationality: string;
  socialSecurityNumber: string;
  rfc: string;
  curp: string;
  weight: string;
  height: string;
  bloodType: string;
  constitution: string;
  healthStatus: string;
  education: string;
  skills: string;
  comments: string;
  emergencyContacts: EmergencyContact[];
  keyAspelNOI: string;
  keyCONTPAQi: string;
  admissionDate: string;
  anniversaryLetter: string;
  visibleRecords: boolean;
  dischargeDate: string | null;
  dischargeReason: string;
  typeOfDischarge: string;
  reEntry?: {
    _id: string;
    reEntryDate: string;
    dischargeDate: string;
    dischargeReason: string;
    typeOfDischarge: string;
  }[];
}

type EmergencyContact = {
  name: string;
  kinship: string;
  phone: PhoneNumberFormat;
};

export interface ModalBasicProps {
  show: boolean;
  onHide: () => void;
  action?: () => void;
  string?: string;
  title?: string;
}

export interface ICheckInFeedback {
  _id: string;
  id: number;
  checks: {
    id: number;
    timestamp: string;
    type: string;
    status: string | null;
    minutesDifference: number;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  user: User;
  employee: Employee;
  departmentEmployee: Department;
  positionEmployee: Position;
  branchEmployee: Branch;
}

export interface IPeriod {
  idPeriod: number;
  documents: IPeriodDocument[];
}

export interface IPeriodDocument {
  id: number;
  url: string;
  idPeriod: number;
  exist: boolean;
  title: string;
  titleView: string;
  createdAt: string;
  dateExpiration?: string;
}
