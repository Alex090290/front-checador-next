import { getUserData, userLoginCredentials } from "@/app/actions/user-actions";
import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Permission, User, UserRole } from "./definitions";

export const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const { email, password } = credentials;
        let user = null;

        user = await userLoginCredentials({
          email: email as string,
          password: password as string,
        });

        if (!user.success) {
          throw new Error(user.message);
        }

        if (user.data?.message !== "OK") {
          throw new Error("Credenciales inválidas");
        }

        const meData = await getUserData({ apiToken: user.data.data });

        const userData = meData.data as unknown as User;

        return {
          apiToken: user.data.data,
          id: String(userData.id),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions,
          status: userData.status,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
    // updateAge: 60 * 5, // Opcional: actualiza el token cada 5 minutos si hay actividad
  },
  secret: process.env.NEXT_AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.apiToken = user.apiToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
        token.status = user.status;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.apiToken = token.apiToken as string;
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as UserRole;
        session.user.permissions = token.permissions as Permission[];
        session.user.status = token.status as 1 | 2 | 3;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
