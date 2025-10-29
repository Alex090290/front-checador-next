"use client";

import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Controller,
  Control,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import Image from "next/image";

type SignatureInputProps = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  rules?: RegisterOptions;
};

const canvasStyles: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: 4,
  width: "100%",
  height: 200,
};

export const SignatureInput: React.FC<SignatureInputProps> = ({
  name,
  control,
  register,
  rules,
}) => {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  return (
    <div>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <SignatureCanvas
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "signature-canvas",
              }}
              ref={(ref) => {
                sigCanvasRef.current = ref;
                // Si hay valor previo, cargarlo en el canvas
                if (ref && value) {
                  ref.fromDataURL(value);
                }
              }}
              onEnd={() => {
                const base64 = sigCanvasRef.current
                  ?.getTrimmedCanvas()
                  .toDataURL("image/png");
                onChange(base64);
              }}
              backgroundColor="#fff"
            />

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sigCanvasRef.current?.clear();
                  onChange("");
                }}
                className="px-3 py-1 text-sm border rounded bg-gray-100 hover:bg-gray-200"
              >
                Borrar Firma
              </button>

              {value && (
                <Image
                  src={value}
                  alt="Firma"
                  width={100}
                  height={50}
                  className="border border-gray-300"
                />
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            )}
          </>
        )}
      />

      {/* Register for field tracking */}
      <input type="hidden" {...register(name, rules)} />
    </div>
  );
};
