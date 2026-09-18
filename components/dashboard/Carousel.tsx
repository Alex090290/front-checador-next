"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";

interface StatCardData {
    id?: string;
    label: string;
    icon: string;
    value?: number;
    accent?: string;
    changed?: boolean;
    view?: string;
}

function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

function StatCard({ label, icon, value, accent = "primary", isPending }: StatCardData & { isPending?: boolean }) {
    const [justArrived, setJustArrived] = useState(false);
    console.log("value:", value);


    useEffect(() => {
        // Solo dispara el flash cuando la data terminó de llegar (isPending pasó a false)
        if (!isPending) {
            setJustArrived(true);
        }
    }, [value, isPending]);

    return (
        <div
            className={["hover-clickable border rounded-4 p-3 h-100 d-flex flex-column mt-1", isPending && "stat-card-loading", justArrived && "collapse-card"].filter(Boolean).join(" ")}
            onAnimationEnd={() => justArrived && setJustArrived(false)}
        >
            <div
                className={`d-flex align-items-center justify-content-center rounded-circle bg-${accent}-subtle text-${accent}-emphasis mb-3`}
                style={{ width: 44, height: 44 }}
            >
                <i className={`bi bi-${icon} fs-5`} />
            </div>
            <div className="fw-bold lh-1 mb-1 text-end" style={{ fontSize: "clamp(2rem, 6vw, 4.25rem)" }}>
                {value ?? "—"}
            </div>
            <div className="text-muted small mt-auto text-end">{label}</div>
        </div>
    );
}



export default function StatCardCarousel({
    items,
    chunkSize = 4,
    isPending,
    view
}: {
    items: StatCardData[];
    chunkSize?: number;
    isPending?: boolean;
    view: string;
}) {
    const groups = chunk(items, chunkSize);
    const [index, setIndex] = useState(0);
    const router = useRouter();

    const isFirst = index === 0;
    const isLast = index === groups.length - 1;

    const goTo = (direction: 1 | -1) => {
        setIndex((prev) => {
            const next = prev + direction;
            if (next < 0 || next >= groups.length) return prev;
            return next;
        });
    };

    const handleView = () => {
        router.push(`/app/${view}?view_type=form&id=null`);
    }

    return (
        <div>
            {groups.length > 1 && (
                <div className="d-flex justify-content-end gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => goTo(-1)}
                        disabled={isFirst}
                        className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, opacity: isFirst ? 0.4 : 1 }}
                        aria-label="Anterior"
                    >
                        <i className="bi bi-chevron-left" />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo(1)}
                        disabled={isLast}
                        className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, opacity: isLast ? 0.4 : 1 }}
                        aria-label="Siguiente"
                    >
                        <i className="bi bi-chevron-right" />
                    </button>
                </div>
            )}

            <Carousel
                activeIndex={index}
                onSelect={setIndex}
                controls={false}
                indicators={false}
                interval={null}
                touch
            >
                {groups.map((group, i) => (
                    <Carousel.Item key={i}>
                        <div
                            className="d-grid gap-3 px-1 mb-2"
                            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
                            onClick={handleView}
                        >
                            {group.map((item) => (
                                <StatCard key={item.label} {...item} isPending={isPending} />
                            ))}
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
}