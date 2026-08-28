"use client";

import React, { useRef, useEffect, useState } from "react";
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 450, height: 125 });

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.offsetWidth;
      const width = Math.min(availableWidth, 750);
      const height = width < 400 ? 150 : 260;
      setCanvasSize({ width, height });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // NUEVO: cambiar width/height de un <canvas> lo borra a transparente (comportamiento
  // del navegador). El wrapper de react-signature-canvas no repinta el fondo automáticamente
  // tras ese cambio, así que lo forzamos aquí. Solo si está vacío, para no borrar una firma
  // ya dibujada o cargada.
  useEffect(() => {
    if (sigCanvasRef.current && sigCanvasRef.current.isEmpty()) {
      sigCanvasRef.current.clear();
    }
  }, [canvasSize]);

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
    <div ref={containerRef}>
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
                    width: canvasSize.width,
                    height: canvasSize.height,
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
                    variant="info"
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
