import { ModalProvider } from "@/context/ModalContext";
import FormVerifyTwoFactor from "../views/FormVerifyTwoFactor";

function PageVerifyTwoFactor() {
  return (
    <ModalProvider>
      <FormVerifyTwoFactor />
    </ModalProvider>
  );
}

export default PageVerifyTwoFactor;
