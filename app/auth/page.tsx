import { ModalProvider } from "@/context/ModalContext";
import FormLogin from "./views/FormLogin";

function PageLogin() {
  return (
    <ModalProvider>
      <FormLogin />
    </ModalProvider>
  );
}

export default PageLogin;
