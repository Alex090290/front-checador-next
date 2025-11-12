"use client";

import React, { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Controller,
  Control,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import Image from "next/image";
import { Button } from "react-bootstrap";

type SignatureInputProps = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  rules?: RegisterOptions;
  disabled?: boolean;
};

export const SignatureInput: React.FC<SignatureInputProps> = ({
  name,
  control,
  register,
  rules,
  disabled = false,
}) => {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    // Si hay una firma en base64, cargarla solo una vez al inicio
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) return;

    const loadSignature = (value: string) => {
      if (value && sigCanvasRef.current) {
        sigCanvasRef.current.fromDataURL(value);
      }
    };

    // Usamos un pequeño delay para asegurar que el canvas esté montado correctamente
    setTimeout(() => {
      if (sigCanvasRef.current && control?._defaultValues?.[name]) {
        loadSignature(control._defaultValues[name]);
      }
    }, 100);
  }, [control, name]);

  return (
    <div>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            {disabled ? (
              value ? (
                <Image
                  src={value}
                  alt="Firma"
                  width={500}
                  height={200}
                  className="border rounded"
                />
              ) : (
                <div className="border p-4 text-center rounded">Sin firma</div>
              )
            ) : (
              <>
                <SignatureCanvas
                  penColor="black"
                  canvasProps={{
                    width: 450,
                    height: 125,
                    className: "signature-canvas border rounded",
                  }}
                  ref={sigCanvasRef}
                  onEnd={() => {
                    const base64 = sigCanvasRef.current
                      ?.getTrimmedCanvas()
                      .toDataURL("image/png");
                    onChange(base64);
                  }}
                  backgroundColor="#fff"
                />

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="warning"
                    onClick={() => {
                      sigCanvasRef.current?.clear();
                      onChange("");
                    }}
                  >
                    Borrar Firma
                  </Button>
                </div>
              </>
            )}

            {error && <p className="mt-1">{error.message}</p>}
          </>
        )}
      />

      <input type="hidden" {...register(name, rules)} />
    </div>
  );
};
