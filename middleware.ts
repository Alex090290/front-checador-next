// import { auth } from "@/lib/auth";

// export default auth((req) => {
//   if (!req.auth && req.nextUrl.pathname !== "/auth") {
//     const newUrl = new URL("/auth", req.nextUrl.origin);
//     return Response.redirect(newUrl);
//   }
// });

// export const config = {
//   matcher: ["/app/:path*"],
// };

// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  // 🔒 Si está autenticado y trata de ir a /auth -> lo mandamos a /dashboard
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 🛑 Si no está autenticado y trata de entrar a rutas privadas -> lo mandamos a /auth
  if (!isAuth && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // ✅ Si todo está bien, continúa
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"], // Rutas que interceptamos
};
