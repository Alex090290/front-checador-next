import { ModalProvider } from "@/context/ModalContext";
import ChecadorFormView from "./ChecadorFormView";
import NotFound from "@/app/not-found";

async function ChecadorMainView({ viewType }: { viewType: string }) {
  if (viewType === "form") {
    return (
      <ModalProvider>
        <ChecadorFormView />
      </ModalProvider>
    );
  } else {
    return <NotFound />;
  }
}

export default ChecadorMainView;
