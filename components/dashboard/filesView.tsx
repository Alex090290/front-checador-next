"use client"


interface StatCardData {
    id?: string;
    label: string;
    icon: string;
    value?: number;
    accent?: string;
    changed?: boolean;
    view?: string;
}

function StatCard({ label, icon, accent, }: StatCardData) {
    // const [justArrived, setJustArrived] = useState(false);


    // useEffect(() => {
    //     // Solo dispara el flash cuando la data terminó de llegar (isPending pasó a false)
    //     if (!isPending) {
    //         setJustArrived(true);
    //     }
    // }, [value, isPending]);

    return (
        <div
            className="hover-clickable border rounded-4 p-3 h-100 d-flex flex-column m-2"
            style={{ maxHeight: "300px", width: "200px" }}
        >
            <div
                className={`d-flex align-items-center justify-content-center rounded-circle bg-${accent}-subtle text-${accent}-emphasis mb-3`}
                style={{ width: 44, height: 44 }}
            >
                <i className={`bi bi-${icon} fs-5`} />
            </div>
            <div className="fw-bold lh-1 mb-1 text-end" style={{ fontSize: "clamp(2rem, 6vw, 4.25rem)" }}>

            </div>
            <div className="text-muted small mt-auto text-end">{label}</div>
        </div>
    );
}

export default function CardsFiles() {
    return (
        // <div className="d-flex justify-content-between align-itmes-center">
            <StatCard
                label="TEST"
                icon="bi bi-file"
                accent="primary"
            />
        // </div>
    )

}