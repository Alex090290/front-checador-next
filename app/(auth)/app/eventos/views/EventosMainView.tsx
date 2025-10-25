import NotFound from "@/app/not-found";
import EventosListView from "./EventosListView";
import { ICheckInFeedback } from "@/lib/definitions";
import { fetchEventos } from "@/app/actions/eventos-actions";

async function EventosMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let eventos: ICheckInFeedback[] = [];

  if (id && id !== "null") {
  }

  eventos = await fetchEventos();

  if (viewType === "list") {
    return <EventosListView eventos={eventos} />;
  } else {
    return <NotFound />;
  }
}

export default EventosMainView;
