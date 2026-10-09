import { getTermsById } from "@/app/actions/termsAndConditions-actions";
import InfoOneTerms from "@/components/termsAndConditions/InfoOneTerms";

export default async function TermsInfoOnePage({ id }: { id: string }) {

    const terms = await getTermsById(Number(id));

    return (
        <InfoOneTerms terms={terms.data ?? null} message={terms.success ? "" : terms.message} />
    )
}
