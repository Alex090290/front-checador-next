"use client"

import { Employee } from "@/lib/definitions";
import { OverTime } from "@/lib/overTime/interface";
import { EmployeeLite } from "../configSystem/formUpdate";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { useState } from "react";
import { useModals } from "@/context/ModalContext";
import { useRouter } from "next/router";
import OvertimeOneError from "./overtimeMessageError";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";

function formatText(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

function InfoItem({
    label,
    value,
    className = "",
    uppercase = true,
}: {
    label: string;
    value?: React.ReactNode;
    className?: string;
    uppercase?: boolean;
    employee?: Employee[];

}) {
    return (
        <div className={className}>
            <div className="text-secondary-emphasis fw-semibold mb-1">{label}</div>
            <div className={uppercase ? "fw-medium text-uppercase" : "fw-medium"}>
                {value ?? "-"}
            </div>
        </div>
    );
}

//En esta funcion colocaremos las sesiones para identificar quien firma 
export function OvertimeOne({
    overtime,
    employees = [],
}: {
    overtime: OverTime | null;
    employees?: EmployeeLite[];
}) {

    // Aqui los const 
    const session = useSessionSnapshot();
    const [showUpdateConstancyModal, setShowUpdateConstancyModal] = useState(false);
    const [employeeSignatureModal, setEmployeeSignatureModal] = useState(false);
    const [showCurretUser, setCurrentUser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();
    const [involvedShow, setInvolvedShow] = useState(false);
    const router = useRouter();

    // Aqui los helpers

    //Mensaje de error al encontrar
    if (!overtime) {
        return (
            <OvertimeOneError />
        )
    }

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

        </>
    )
}
