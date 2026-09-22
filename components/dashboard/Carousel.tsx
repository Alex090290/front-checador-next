"use client";

import { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";

interface StatCardData {
    id?: string;
    label: string;
    icon: string;
    value?: number;
    accent?: string;
    changed?: boolean;
    view?: string;
}

function viewType(view: string | null) {
    switch ((view ?? 0)) {
        case "permissions":
            return "permissions";
        case "vacationList":
            return "vacationList";
        case "penalties":
            return "penalties";
        case "inability":
            return "inability";
        case "overtime":
            return "overtime";
    }
}

function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

function StatCard({ label, icon, value, accent = "primary", isPending, onClick }: StatCardData & { isPending?: boolean; onClick?: () => void }) {
    const [justArrived, setJustArrived] = useState(false);


    useEffect(() => {
        // Solo dispara el flash cuando la data terminó de llegar (isPending pasó a false)
        if (!isPending) {
            setJustArrived(true);
        }
    }, [value, isPending]);

    return (
        <div
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(e) => {
                if (onClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onClick();
                }
            }}
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
    isPending}: {
    items: StatCardData[];
    chunkSize?: number;
    isPending?: boolean;
}) {
    const groups = chunk(items, chunkSize);
    const [index, setIndex] = useState(0);

    const isFirst = index === 0;
    const isLast = index === groups.length - 1;

    const goTo = (direction: 1 | -1) => {
        setIndex((prev) => {
            const next = prev + direction;
            if (next < 0 || next >= groups.length) return prev;
            return next;
        });
    };

    const handleView = (view: string | undefined) => {
        const url = `/app/${viewType(String(view))}?view_type=form&id=null`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="h-100 p-3">
            <ConditionalRender cond={groups.length > 1}>
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
            </ConditionalRender>

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
                                className="d-grid gap-3 px-1 mb-5"
                                style={{gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))"}}
                            >
                                {group.map((item) => (
                                    <StatCard
                                        key={item.label} {...item}
                                        isPending={isPending}
                                        onClick={() => {
                                            if(item.view === "absences"){
                                                return null
                                            } else{
                                                return handleView(String(item.view))
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </Carousel.Item>
                    )
                )}
            </Carousel>
        </div>
    );
}