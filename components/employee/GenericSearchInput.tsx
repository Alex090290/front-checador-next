"use client";

import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function GenericSearchInput({
  initialValue = "",
  onSearch,
  placeholder = "",
  delay = 500,
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
      className="shadow-sm border-1 border-secondary"
      type="text"
       placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      />
  );
}