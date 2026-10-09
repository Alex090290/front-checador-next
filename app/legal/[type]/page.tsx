export const dynamic = "force-dynamic";
import { getPublicTerms } from "@/app/actions/termsAndConditions-actions";
import PublicTermsView from "@/components/termsAndConditions/PublicTermsView";
import { notFound } from "next/navigation";

// Página PÚBLICA (fuera de /app, sin sesión): /legal/terminos y /legal/privacidad
async function PageLegal({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (type !== "terminos" && type !== "privacidad") notFound();

  const res = await getPublicTerms(type);

  return (
    <PublicTermsView
      type={type}
      terms={res.data ?? null}
      message={res.success ? "" : res.message}
    />
  );
}

export default PageLegal;
