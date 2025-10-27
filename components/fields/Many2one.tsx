"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useController, Control } from "react-hook-form";
import { Form, Dropdown } from "react-bootstrap";

export interface Many2OneOption {
  id: number | string;
  name?: string | null;
  displayName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

type Props<T extends Many2OneOption> = {
  name: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  options: T[] | null;
  disabled?: boolean;
  size?: "sm" | "lg";
  callBackMode: "object" | "id";
  className?: string;
  required?: boolean;
  isInvalid?: boolean;
};

export function Many2one<T extends Many2OneOption>({
  name,
  label,
  control,
  options,
  disabled,
  size,
  callBackMode = "id",
  className,
  required,
  isInvalid,
}: Props<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔄 Sincroniza el valor inicial y cambios externos
  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }

    if (typeof value === "object" && "id" in value) {
      setQuery(value.name ?? value.displayName ?? "");
    } else if (options) {
      const found = options.find((o) => o.id === value);
      setQuery(found?.name ?? found?.displayName ?? "");
    }
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!query) return options ?? [];
    return (
      options?.filter(
        (opt) =>
          opt && opt.displayName?.toLowerCase().includes(query.toLowerCase())
      ) ?? []
    );
  }, [query, options]);

  const handleSelect = (option: T) => {
    const newValue =
      callBackMode === "id"
        ? typeof value === "object"
          ? option.id
          : option.id
        : typeof value === "object"
        ? option
        : option;
    onChange(newValue);
    setQuery(option.name ?? option.displayName ?? "");
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const handleBlur = () => {
    if (!query) {
      onChange(null);
      return;
    }

    const exactMatch = options?.find(
      (o) => (o.name ?? o.displayName)?.toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      handleSelect(exactMatch);
    } else {
      // Limpia el valor si no hay coincidencia exacta
      onChange(null);
      setQuery("");
    }
  };

  // 🔒 Cierre al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ⌨️ Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 < filteredOptions.length ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredOptions[highlightedIndex];
      if (selected) handleSelect(selected);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="w-100">
      <Form.Control
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => {
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={label || ""}
        autoComplete="off"
        isInvalid={isInvalid}
        disabled={disabled}
        size={size}
        required={required}
        className={`${className} shadow-none border-0`}
      />
      <Form.Control.Feedback type="invalid">
        {error?.message}
      </Form.Control.Feedback>

      {isOpen && filteredOptions.length > 0 && (
        <Dropdown show className="w-100 mt-1">
          <Dropdown.Menu
            style={{
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
              overflowX: "auto",
              zIndex: 1050,
              fontSize: "0.9rem",
            }}
            className="p-0"
          >
            {filteredOptions.slice(0, 8).map((option, index) => (
              <Dropdown.Item
                key={option.id}
                onMouseDown={() => handleSelect(option)}
                active={index === highlightedIndex}
                className="text-wrap border-bottom"
              >
                {option.displayName}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}
