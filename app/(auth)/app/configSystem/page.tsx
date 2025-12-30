"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { IConfigSystem, updateConfigSystem } from "@/app/actions/configSystem-actions";
import { ActionResponse } from "@/lib/definitions";
import ConfigSystemView from "@/components/configSystem/formView";
import ConfigSystemUpdate from "@/components/configSystem/formUpdate";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Mode = "view" | "edit";

export default function ConfigSystem() {
  const { data, mutate, error, isLoading } = useSWR("/api/configsystem", fetcher);
  const [mode, setMode] = useState<Mode>("view");
  const [isEditLoading, setIsEditLoading] = useState(false);

  const config: IConfigSystem | null = useMemo(() => {
    const maybe = data?.data?.[0];
    return maybe ?? null;
  }, [data]);

  const saveConfig = async (payload: any): Promise<ActionResponse<IConfigSystem>> => {
    try {
      const res = await updateConfigSystem(payload);

      if (!res?.success) {
        return {
          success: false,
          message: res?.message ?? "No se pudo guardar",
          data: undefined,
        };
      }

      await mutate(); // refresca lo que se ve en View
      setMode("view");

      return {
        success: true,
        message: res?.message ?? "Guardado",
        data: undefined,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message ?? "Error inesperado",
        data: undefined,
      };
    }
  };

  if (isLoading) return <p className="text-muted">Cargando...</p>;
  if (error) return <p className="text-danger">Error cargando configuración</p>;
  if (!config) return <p className="text-muted">No hay configuración</p>;

  return (
    <div className="container py-3">
      {mode === "view" ? (
        <ConfigSystemView
          data={config}
          isLoading={isEditLoading}
          onEdit={async () => {
            try {
              setIsEditLoading(true);
              await mutate(); // opcional si quieres refrescar antes de editar
              setMode("edit");
            } finally {
              setIsEditLoading(false);
            }
          }}
        />
      ) : (
        <ConfigSystemUpdate
          initialData={config}
          onCancel={() => setMode("view")}
          onSave={saveConfig}
        />
      )}
    </div>
  );
}
