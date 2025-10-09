import NotFound from "@/app/not-found";
import CatalogListView from "./EmployeeListView";
import { User } from "@/lib/definitions";

async function EmployeeMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  // let employees: User[] = [];

  if (viewType === "list") {
    return <CatalogListView employees={[]} />;
  } else if (viewType === "form") {
    return <h3>Formulario de usuarios</h3>;
  } else {
    return <NotFound />;
  }
}

export default EmployeeMainView;
