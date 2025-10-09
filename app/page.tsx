import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageChecador from "./(auth)/app/checador/page";

async function Home() {
  const session = await auth();

  if (
    (session?.user && session.user.role === "CHECADOR") ||
    session?.user?.role === "EMPLOYEE"
  ) {
    return <PageChecador />;
  } else {
    return redirect("/app");
  }
}

export default Home;
