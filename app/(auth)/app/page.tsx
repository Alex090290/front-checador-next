import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";

async function PageApp() {
  return (
  <Suspense fallback={<Loading message="Cargando datos..." />}>
  <h2>Administración</h2>
  </Suspense>
)}

export default PageApp;
 