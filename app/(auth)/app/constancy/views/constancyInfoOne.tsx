import { fetchConstancies } from "@/app/actions/constancy-actions";
import { findConstancyById } from "@/app/actions/constancy-actions";
import { ConstancyOne } from "@/components/constancy/ConstancyInfoOne";

export default async function ConstancyInfoOne({ id }: { id: string }) {
    const [constancy, allConstancies] = await Promise.all([
        findConstancyById({ id: Number(id) }),
        fetchConstancies({ page: 1, limit: 500 }),
    ]);

    const backgrounds = constancy
        ? allConstancies.filter(
              (item) =>
                  Number(item.idEmployee) === Number(constancy.idEmployee) &&
                  Number(item.id) !== Number(constancy.id)
          )
        : [];

    const constancyWithBackgrounds = constancy
        ? {
              ...constancy,
              backgrounds,
          }
        : null;

    return <ConstancyOne constancy={constancyWithBackgrounds} />;
}