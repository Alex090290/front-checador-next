import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

async function Home() {
  const session = await auth();

  if (session?.user) {
    return redirect("/app/checador?view_type=form");
  } else {
    return redirect("/auth");
  }
}

export default Home;
