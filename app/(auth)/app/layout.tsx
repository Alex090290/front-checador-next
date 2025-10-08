import TopNav from "@/components/top-nav/TopNav";
import { ModalProvider } from "@/context/ModalContext";
import { SessionProvider } from "next-auth/react";

function LayoutApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ModalProvider>
        <div className="d-flex flex-column vh-100">
          <TopNav />
          <main className="container-fluid flex-fill overflow-hidden">
            {children}
          </main>
        </div>
      </ModalProvider>
    </SessionProvider>
  );
}

export default LayoutApp;
