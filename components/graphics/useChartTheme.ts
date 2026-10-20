"use client";

import { useEffect, useState } from "react";

export type ChartTheme = {
    text: string;
    muted: string;
    grid: string;
    tooltipBg: string;
    colors: Record<string, string>;
};

const COLOR_VARS = ["primary", "pink", "orange", "teal", "danger", "success", "purple", "info", "warning"];

const FALLBACK: ChartTheme = {
    text: "#343a40",
    muted: "#6c757d",
    grid: "rgba(0, 0, 0, 0.1)",
    tooltipBg: "rgba(0, 0, 0, 0.85)",
    colors: {
        primary: "#4582ec",
        pink: "#d63384",
        orange: "#fd7e14",
        teal: "#20c997",
        danger: "#d9534f",
        success: "#02b875",
        purple: "#6f42c1",
        info: "#17a2b8",
        warning: "#f0ad4e",
    },
};

function readTheme(): ChartTheme {
    const style = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => style.getPropertyValue(`--bs-${name}`).trim() || fallback;

    const colors: Record<string, string> = {};
    COLOR_VARS.forEach((name) => {
        colors[name] = read(name, FALLBACK.colors[name]);
    });

    return {
        text: read("body-color", FALLBACK.text),
        muted: read("secondary-color", FALLBACK.muted),
        grid: read("border-color-translucent", FALLBACK.grid),
        tooltipBg: FALLBACK.tooltipBg,
        colors,
    };
}

// Colores de Bootstrap ya resueltos para chart.js (canvas no entiende var()); se recalculan al cambiar el modo oscuro
export function useChartTheme(): ChartTheme {
    const [theme, setTheme] = useState<ChartTheme>(FALLBACK);

    useEffect(() => {
        setTheme(readTheme());

        const observer = new MutationObserver(() => setTheme(readTheme()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });

        return () => observer.disconnect();
    }, []);

    return theme;
}

// Color con transparencia para el relleno de las barras
export function withAlpha(color: string, alpha: number): string {
    const hex = color.replace("#", "");
    if (/^[0-9a-f]{6}$/i.test(hex)) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
}
