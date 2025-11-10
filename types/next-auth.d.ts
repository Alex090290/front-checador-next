import { Permission, UserRole } from "@/lib/definitions";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    apiToken: string;
    role: UserRole;
    permissions: Permission[];
    status: 1 | 2 | 3;
    idEmployee: number | null;
  }
}
