import { Constancy } from "@/lib/constancy/interface";

export default async function ListAllConstancies ({
    id,
    page = "1",
    limit = "20",
    search = "",

}: {
    id: string;
    page?: string;
    limit?: string;
    search?: string;
}) {
    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

    
}

