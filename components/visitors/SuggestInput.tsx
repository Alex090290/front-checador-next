"use client";

import { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";

//Input con sugerencias debajo (autocompletado): mínimo 2 letras y debounce de 300 ms. Elegir una es opcional
export default function SuggestInput<T>({
    id,
    label,
    value,
    onChange,
    fetchSuggestions,
    getKey,
    renderItem,
    onSelect,
    invalid,
    feedback,
    maxLength,
    placeholder,
    autoFocus,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    fetchSuggestions: (search: string) => Promise<T[]>;
    getKey: (item: T) => string;
    renderItem: (item: T) => React.ReactNode;
    onSelect: (item: T) => void;
    invalid?: boolean;
    feedback?: string;
    maxLength?: number;
    placeholder?: string;
    autoFocus?: boolean;
}) {
    const [items, setItems] = useState<T[]>([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    // Al elegir una sugerencia no se vuelve a buscar con el texto que se acaba de poner
    const skipNextSearch = useRef(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (skipNextSearch.current) {
            skipNextSearch.current = false;
            return;
        }

        const term = value.trim();
        if (term.length < 2) {
            setItems([]);
            setOpen(false);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            const result = await fetchSuggestions(term);
            if (cancelled) return;
            setItems(result);
            setActive(-1);
            setOpen(result.length > 0);
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [value, fetchSuggestions]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const select = (item: T) => {
        skipNextSearch.current = true;
        onSelect(item);
        setOpen(false);
        setItems([]);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || items.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, items.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            select(items[active]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <Form.Group controlId={id} className="mb-2 position-relative" ref={wrapperRef}>
            <Form.Label className="fw-semibold">{label}</Form.Label>
            <Form.Control
                type="text"
                className="border text-uppercase"
                value={value}
                maxLength={maxLength}
                placeholder={placeholder}
                autoComplete="off"
                autoFocus={autoFocus}
                isInvalid={invalid}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => items.length > 0 && setOpen(true)}
                onKeyDown={onKeyDown}
            />
            <Form.Control.Feedback type="invalid">{feedback}</Form.Control.Feedback>

            {open && (
                <div
                    className="list-group position-absolute w-100 shadow-sm mt-1"
                    style={{ zIndex: 10, maxHeight: 240, overflowY: "auto" }}
                    role="listbox"
                >
                    {items.map((item, index) => (
                        <button
                            key={getKey(item)}
                            type="button"
                            role="option"
                            aria-selected={index === active}
                            className={`list-group-item list-group-item-action small ${index === active ? "active" : ""}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => select(item)}
                        >
                            {renderItem(item)}
                        </button>
                    ))}
                </div>
            )}
        </Form.Group>
    );
}
