import NotFound from "@/app/not-found";
import NewsletterListView from "./NewsletterListView";
import NewsletterFormView from "./NewsletterFormView";
import { Newsletter } from "@/lib/definitions";
import {
  fetchNewsletters,
  findNewslettersById,
} from "@/app/actions/newsletter-actions";

async function NewsletterMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let newsletter: Newsletter | null = null;
  let newsletters: Newsletter[] = [];

  if (id && id !== "null") {
    newsletter = await findNewslettersById({ id });
  }

  [newsletters] = await Promise.all([fetchNewsletters()]);

  if (viewType === "list") {
    return <NewsletterListView newsletters={newsletters} />;
  } else if (viewType === "form") {
    return <NewsletterFormView id={id} newsletter={newsletter} />;
  } else {
    return <NotFound />;
  }
}

export default NewsletterMainView;
