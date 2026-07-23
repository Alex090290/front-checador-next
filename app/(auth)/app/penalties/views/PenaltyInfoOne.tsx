import { findPenalty } from "@/app/actions/penalties-actions";
import { PenaltyOne } from "@/components/penalties/PenaltyInfoOne";

export default async function PenaltyInfoOne ({ id }: { id: string }) {
    
    const [penalty] = await Promise.all([
        findPenalty({ id: Number(id) })
    ]);

    return <PenaltyOne penalty={penalty!}/>;
}