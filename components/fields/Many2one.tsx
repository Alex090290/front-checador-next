"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Control, useController } from "react-hook-form";
import { Dropdown, Form } from "react-bootstrap";

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
  callBackMode?: "object" | "id";
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
  } = useController({
    name,
    control,
  });

  /*
   * Texto visible en el input.
   */
  const [query, setQuery] = useState("");

  /*
   * Indica si el usuario realmente está escribiendo
   * una búsqueda.
   *
   * false:
   *   query representa el registro seleccionado.
   *
   * true:
   *   query representa texto de búsqueda.
   */
  const [isSearching, setIsSearching] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * ---------------------------------------------------
   * Obtener nombre para mostrar
   * ---------------------------------------------------
   */

  const getOptionLabel = (option?: T | null) =>
    option?.displayName ?? option?.name ?? "";

  /*
   * ---------------------------------------------------
   * Sincronizar valor externo
   * ---------------------------------------------------
   */

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setQuery("");
      setIsSearching(false);
      return;
    }

    /*
     * callBackMode = object
     */
    if (typeof value === "object" && "id" in value) {
      setQuery(
        value.displayName ??
          value.name ??
          ""
      );

      setIsSearching(false);
      return;
    }

    /*
     * callBackMode = id
     */
    const found = options?.find(
      (option) => option.id === value
    );

    if (found) {
      setQuery(getOptionLabel(found));
      setIsSearching(false);
    }
  }, [value, options]);

  /*
   * ---------------------------------------------------
   * Opciones filtradas
   * ---------------------------------------------------
   *
   * IMPORTANTE:
   *
   * Si no estamos buscando activamente, mostramos
   * TODAS las opciones aunque ya exista una selección.
   *
   * Esto es lo que corrige tu problema.
   * ---------------------------------------------------
   */

  const filteredOptions = useMemo(() => {
    if (!options) {
      return [];
    }

    if (!isSearching || !query.trim()) {
      return options;
    }

    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return options.filter((option) => {
      const label = getOptionLabel(option)
        .toLowerCase();

      return label.includes(normalizedQuery);
    });
  }, [query, options, isSearching]);

  /*
   * ---------------------------------------------------
   * Seleccionar
   * ---------------------------------------------------
   */

  const handleSelect = (option: T) => {
    if (callBackMode === "id") {
      onChange(option.id);
    } else {
      onChange(option);
    }

    setQuery(getOptionLabel(option));

    setIsSearching(false);
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  /*
   * ---------------------------------------------------
   * Cambiar texto
   * ---------------------------------------------------
   */

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const text = event.target.value;

    setQuery(text);
    setIsSearching(true);
    setIsOpen(true);
    setHighlightedIndex(0);

    /*
     * Si el usuario empieza a modificar el texto,
     * el registro anterior deja de considerarse
     * seleccionado.
     */
    if (!text) {
      onChange(null);
    }
  };

  /*
   * ---------------------------------------------------
   * Focus
   * ---------------------------------------------------
   */

  const handleFocus = (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    setIsOpen(true);
    setIsSearching(false);
    setHighlightedIndex(0);

    /*
     * Comportamiento parecido a Odoo:
     *
     * al entrar nuevamente en un Many2one seleccionado,
     * seleccionamos el texto para que escribir lo
     * reemplace inmediatamente.
     */
    requestAnimationFrame(() => {
      event.target.select();
    });
  };

  /*
   * ---------------------------------------------------
   * Blur
   * ---------------------------------------------------
   */

  const handleBlur = () => {
    /*
     * Si no estaba buscando, simplemente dejamos
     * la selección actual.
     */
    if (!isSearching) {
      return;
    }

    if (!query.trim()) {
      onChange(null);
      setQuery("");
      setIsSearching(false);
      return;
    }

    /*
     * Buscar coincidencia exacta.
     */
    const exactMatch = options?.find(
      (option) =>
        getOptionLabel(option).toLowerCase() ===
        query.trim().toLowerCase()
    );

    if (exactMatch) {
      handleSelect(exactMatch);
      return;
    }

    /*
     * Si lo escrito no corresponde con ningún registro,
     * restauramos el registro anteriormente seleccionado.
     */
    if (value) {
      if (typeof value === "object" && "id" in value) {
        setQuery(
          value.displayName ??
            value.name ??
            ""
        );
      } else {
        const selectedOption = options?.find(
          (option) => option.id === value
        );

        setQuery(
          selectedOption
            ? getOptionLabel(selectedOption)
            : ""
        );
      }
    } else {
      setQuery("");
    }

    setIsSearching(false);
  };

  /*
   * ---------------------------------------------------
   * Click fuera
   * ---------------------------------------------------
   */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ---------------------------------------------------
   * Navegación teclado
   * ---------------------------------------------------
   */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      !isOpen ||
      filteredOptions.length === 0
    ) {
      if (event.key === "ArrowDown") {
        setIsOpen(true);
      }

      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        setHighlightedIndex((prev) =>
          Math.min(
            prev + 1,
            Math.min(filteredOptions.length, 8) - 1
          )
        );

        break;

      case "ArrowUp":
        event.preventDefault();

        setHighlightedIndex((prev) =>
          Math.max(prev - 1, 0)
        );

        break;

      case "Enter": {
        event.preventDefault();

        const selected =
          filteredOptions[highlightedIndex];

        if (selected) {
          handleSelect(selected);
        }

        break;
      }

      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  /*
   * ---------------------------------------------------
   * Render
   * ---------------------------------------------------
   */

  return (
    <div
      ref={containerRef}
      className="position-relative"
    >
      <Form.Control
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={label || ""}
        autoComplete="off"
        isInvalid={isInvalid || !!error}
        disabled={disabled}
        size={size}
        required={required}
        className={`${className ?? ""} shadow-none border`}
      />

      <Form.Control.Feedback type="invalid">
        {error?.message}
      </Form.Control.Feedback>

      {isOpen &&
        filteredOptions.length > 0 && (
          <Dropdown
            show
            className="w-100 mt-1"
          >
            <Dropdown.Menu
              show
              style={{
                width: "100%",
                maxHeight: "220px",
                overflowY: "auto",
                overflowX: "hidden",
                zIndex: 1050,
                fontSize: "0.9rem",
              }}
              className="p-0"
            >
              {filteredOptions
                .slice(0, 10)
                .map((option, index) => (
                  <Dropdown.Item
                    key={option.id}
                    onMouseDown={(event) => {
                      /*
                       * Evita que el input haga blur
                       * antes de seleccionar.
                       */
                      event.preventDefault();

                      handleSelect(option);
                    }}
                    active={
                      index === highlightedIndex
                    }
                    className="text-wrap border-bottom"
                  >
                    {getOptionLabel(option)}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
    </div>
  );
}