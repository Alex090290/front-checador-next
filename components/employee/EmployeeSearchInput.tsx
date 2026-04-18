"use client";

import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function EmployeeSearchInput({
  initialValue = "",
  onSearch,
  placeholder = "Buscar empleado...",
  delay = 400,
}: {
  initialValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  delay?: number;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value.trim());
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay, onSearch]);

  return (
    <Form.Control
      type="text"
      size="sm"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-100"
    />
  );
}