import { Department, IFoodBaucher, UserRole } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";

export type TInputsEmployee = {
  name: string;
  lastName: string;
  phonePersonal: string;
  emailPersonal: string;
  idCheck: number | null;
  passwordCheck: number | null;
  entryOffice: string;
  entrySaturdayOffice: string;
  exitOffice: string;
  exitSaturdayOffice: string;
  entryLunch: string;
  exitLunch: string;
  idDepartment: Department | null;
  idPosition: number | null;
  branch: number | null;
  gender: "MASCULINO" | "FEMENINO";
  status: 1 | 2 | 3;
  phoneCompany: PhoneNumberFormat | string | null;
  phoneExtCompany: number | 0;
  address: {
    street: string;
    numberIn: string;
    numberOut: string;
    state: string;
    country: string;
    municipality: string;
    zipCode: string;
    neighborhood: string;
  };
  emailCompany: string;
  scheduleDescription: string;
  policies: string;
  group: string;
  homePhone: PhoneNumberFormat | string | null;
  sons: number | null;
  daughters: number | null;
  birthDate: string;
  nationality: string;
  socialSecurityNumber: string;
  rfc: string;
  curp: string;
  /** @deprecated ya no se captura (Aviso de privacidad) */
  weight?: number | null;
  /** @deprecated ya no se captura (Aviso de privacidad) */
  height?: number | null;
  bloodType: string;
  /** @deprecated ya no se captura (Aviso de privacidad) */
  constitution?: string;
  healthStatus: string;
  education: string;
  skills: string;
  comments: string;
  emergencyContacts: {
    id?: number;
    name: string;
    kinship: string;
    phone: PhoneNumberFormat | string | null;
  }[];
  keyAspelNOI: string;
  keyCONTPAQi: string;
  admissionDate: string;
  anniversaryLetter: string;
  visibleRecords: boolean;
  dischargeDate: string | null;
  dischargeReason: string;
  typeOfDischarge: string;
  role: UserRole[];
  dailyWage: number;
  foodBaucher?: IFoodBaucher; 
};