// middleware.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/auth") {
    const newUrl = new URL("/auth", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Mientras falte capturar el código 2FA, solo se permite la pantalla de verificación
  if (req.auth?.user?.twoFactorPending && req.nextUrl.pathname !== "/auth/verify") {
    const newUrl = new URL("/auth/verify", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    {
      source: "/app/:path*",
      missing: [{ type: "header", key: "next-action" }],
    },
    {
      source: "/auth/verify",
      missing: [{ type: "header", key: "next-action" }],
    },
  ],
};
