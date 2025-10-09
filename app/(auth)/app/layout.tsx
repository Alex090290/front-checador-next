// app/(admin)/layout.tsx
import Sidebar from "@/components/top-nav/Sidebar";
import TopNav from "@/components/top-nav/TopNav";
import { ModalProvider } from "@/context/ModalContext";
import { SessionProvider } from "next-auth/react";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ModalProvider>
        <div className="d-flex flex-column vh-100">
          <TopNav />
          <div className="d-flex flex-grow-1 overflow-hidden">
            <Sidebar />
            <main className="flex-grow-1 overflow-auto p-0">{children}</main>
          </div>
        </div>
      </ModalProvider>
    </SessionProvider>
  );
}
