import { Department, UserRole } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";

export type TInputsEmployee = {
  name: string;
  lastName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  phonePersonal: string;
  emailPersonal: string;
  idCheck: number;
  passwordCheck: number;
  entryOffice: string;
  entrySaturdayOffice: string;
  exitOffice: string;
  exitSaturdayOffice: string;
  entryLunch: string;
  exitLunch: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  idDepartment: Department | null;
  idPosition: number | null;
  branch: number | null;
  gender: "MASCULINO" | "FEMENINO";
  status: 1 | 2 | 3;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  phoneCompany: string | any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePhone: string | any;
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
  emergencyContacts:
    | {
        id?: number;
        name: string;
        kinship: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        phone: PhoneNumberFormat | any;
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
};
