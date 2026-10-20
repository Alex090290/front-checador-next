// app/(admin)/layout.tsx
import Sidebar from "@/components/top-nav/Sidebar";
import TopNav from "@/components/top-nav/TopNav";
import { ModalProvider } from "@/context/ModalContext";
import { SessionProvider } from "next-auth/react";
import HealthCheck from "./HealthCheck";
import PostLoginGates from "@/components/users/PostLoginGates";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ModalProvider>
        <div className="d-flex flex-column vh-100">
          <TopNav />
          <HealthCheck />
          <PostLoginGates />
          <div className="d-flex overflow-hidden" style={{height: "100vh", minHeight: 0,}}>
            <Sidebar />
            <main className="flex-grow-1 overflow-auto" style={{minWidth: 0, minHeight: 0,}}>{children}</main>
          </div>
        </div>
      </ModalProvider>
    </SessionProvider>
  );
}
