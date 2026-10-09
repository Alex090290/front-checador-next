import { getTermsList } from "@/app/actions/termsAndConditions-actions";
import TermsTableClient from "@/components/termsAndConditions/TermsTableClient";
import { TLegalDocumentType } from "@/lib/termsAndConditions/interface";
import TermsInfoOnePage from "./TermsInfoOne";

export default async function ListAllTerms({
  id,
  page = "1",
  limit = "20",
  type = "",
  search = "",
}: {
  id: string;
  page?: string;
  limit?: string;
  type?: string;
  search?: string;
}) {
  if (id && id !== "null") return <TermsInfoOnePage id={id} />;

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);
  const typeParse: TLegalDocumentType | "" = type === "TERMINOS" || type === "PRIVACIDAD" ? type : "";

  const terms = await getTermsList(pageParse, limitParse, typeParse, search);

  return (
    <TermsTableClient
      terms={terms.data}
      total={terms.total}
      page={pageParse}
      limit={limitParse}
      type={typeParse}
      search={search}
    />
  );
}
