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

export interface ModalBasicProps {
  show: boolean;
  onHide: () => void;
  action?: () => void;
  string?: string;
  title?: string;
}
