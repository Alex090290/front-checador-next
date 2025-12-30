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
  isDoh: boolean;
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
  name: string;
  lastName: string;
  phonePersonal: PhoneNumberFormat | null;
  emailPersonal: string;
  idCheck: number | null;
  passwordCheck: number | null;
  passwordSystem: string;
  entryOffice: string;
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
  dailyWage: number;
  isLeader: number;
  isDoh: number;
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

export interface IPermissionRequest {
  _id: string;
  id: number;
  leaderApproval: PermissionRequestStatus;
  dohApproval: PermissionRequestStatus;
  motive: string;
  incidence: string;
  type: string;
  forHours: boolean;
  forDays: boolean;
  signatures: TSignatures[];
  informationDate: TInformationDate;
  createdAt?: string;
  updatedAt?: string;
  createForPerson: Pick<Employee, "_id" | "id" | "name" | "lastName">;
  employee: Pick<Employee, "_id" | "id" | "name" | "lastName">;
  dateEnd: string;
  dateInit: string;
  hourInt: string;
  hourEnd: string;
  leader: Pick<Employee, "_id" | "id" | "name" | "lastName">;
  personDoh: Pick<Employee, "_id" | "id" | "name" | "lastName">;
  status: PermissionRequestStatus;
  dateApprove?: string;
  dateApproveDoh?: string;
}

export type TSignatures = {
  _id: string;
  id: number;
  idSignatory: number;
  url: string;
  name: string;
  sendNotify: boolean;
  dateApproved?: string;
  status: PermissionRequestStatus;
};

export type PermissionRequestStatus =
  | "APPROVED"
  | "REFUSED"
  | "PENDING"
  | "EMPLOYEE";

export type TInformationDate = {
  _id: string;
  id: number;
  totalHours: number;
  totalDay: number;
  dateInit: string;
  dateEnd: string;
  hourInit: string;
  hourEnd: string;
};

export type Newsletter = {
  _id: string;
  id: number;
  title: string;
  text: string;
  img: string;
  programing: boolean;
  dateInitiPublish: string;
  dateEndPublish: string;
  hourEndPublish: string;
  hourInitiPublish: string;
  createAt?: string;
  updateAt?: string;
};

export interface Vacations {
  _id: string;
  id: number;
  idEmployee: number | null;
  periodDescription: string;
  totalDaysPeriod: number;
  dateInitPeriod: string;
  dateEndPeriod: string;
  idsVacationsRequest: number[];
  idLeader: number | null;
  idPersonDoh: number | null;
  idPeriod: number | null;
  leaderApproval: string;
  daysRequest: number;
  signatures: TSignatures[];
  dateInit: string;
  dateEnd: string;
  isAutomatic: boolean;
  holidayName: string;
  createForPerson: {
    _id: string;
    id: number;
    name: string;
    lastName: string;
  };
  employee: {
    _id: string;
    id: number;
    name: string;
    lastName: string;
  };
  period: {
    _id: string;
    id: number;
    periodDescription: string;
    dateInitPeriod: string;
    dateEndPeriod: string;
  };
  status: VacationRequestStatus;
  vacationsRequestsData: {
    _id: string;
    id: number;
    idEmployee: number;
    idLeader: number | null;
    idPersonDoh: number | null;
    createFor: number;
    leaderApproval: string;
    dohApproval: string;
    daysRequest: number;
    dateInit: string;
    dateEnd: string;
    holidayName: string;
  }[];
  usedDays: number;
  availableDays: number;
  pendingDays: number;
}

export interface PeriodVacation {
  _id: string;
  id: number;
  idEmployee: number;
  periodDescription: string;
  totalDaysPeriod: number;
  dateInitPeriod: string;
  dateEndPeriod: string;
  idsVacationsRequest: number[];
}

export type VacationRequestStatus =
  | "APPROVED"
  | "REFUSED"
  | "PENDING"
  | "EMPLOYEE";

  export interface ConfigSystemUpdate {
		permissions: {
				idPersonApproveDoh: number,
				idPersonApproveLeaders: number
		},
		vacations:{
				idPersonApproveDoh: number,
				idPersonApproveLeaders: number
		}
}