"use client";

import { forwardRef } from "react";
import { Button } from "react-bootstrap";

type DateButtonProps = {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
    isInvalid?: boolean;
};

const DateButton = forwardRef<HTMLButtonElement, DateButtonProps>(
    ({ value, onClick, placeholder, isInvalid }, ref) => {
        return (
            <Button
                ref={ref}
                variant={isInvalid ? "outline-danger" : "outline-secondary"}
                onClick={onClick}
                type="button"
                className="w-100 d-flex align-items-center justify-content-between"
            >
                <span className={value ? "" : "text-muted"}>
                    {value || placeholder}
                </span>
                <i className="bi bi-calendar-event" />
            </Button>
        );
    }
);

DateButton.displayName = "DateButton";

export default DateButton;