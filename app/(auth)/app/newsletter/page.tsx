import Loading from "@/components/LoadingSpinner";
import { lazy, Suspense } from "react";

const NewsletterMainView = lazy(() => import("./views/NewsletterMainView"));

async function PageNewsletter({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <NewsletterMainView id={id} viewType={viewType} />
    </Suspense>
  );
}

export default PageNewsletter;
