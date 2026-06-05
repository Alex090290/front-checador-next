"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { IConfigSystem, updateConfigSystem } from "@/app/actions/configSystem-actions";
import { ActionResponse, ConfigSystemUpdate } from "@/lib/definitions";
import ConfigSystemView from "@/components/configSystem/formView";
import ConfigSystemUpdateComp from "@/components/configSystem/formUpdate";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Mode = "view" | "edit";

export default function ConfigSystem() {
  const { data, mutate, error, isLoading, isValidating } = useSWR("/api/configsystem", fetcher);
  const [mode, setMode] = useState<Mode>("view");
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await mutate();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [mutate]);


  const config: IConfigSystem | null = useMemo(() => {
    const maybe = data?.data?.[0];
    return maybe ?? null;
  }, [data]);

  const saveConfig = async (
    payload: ConfigSystemUpdate
  ): Promise<ActionResponse<IConfigSystem>> => {
    try {
      const res = await updateConfigSystem(payload);

      if (!res?.success) {
        return {
          success: false,
          message: res?.message ?? "No se pudo guardar",
          data: undefined,
        };
      }

      await mutate();
      setMode("view");

      return {
        success: true,
        message: res?.message ?? "Guardado",
        data: undefined,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      return {
        success: false,
        message,
        data: undefined,
      };
    }
  };

  return (
    <>
      <ConditionalRender cond={loading || isLoading || isValidating}>
        <Loading message="Cargando datos..." />
      </ConditionalRender>

      {error && (
        <p className="text-danger">Error cargando configuración</p>
      )}

      {!config && !loading && !isLoading && !isValidating ? (
        <p className="text-muted">No hay configuración</p>
      ) : config ? (
        <div className="container py-3">
          {mode === "view" ? (
            <ConfigSystemView
              data={config}
              isLoading={isEditLoading}
              onEdit={async () => {
                try {
                  setIsEditLoading(true);
                  await mutate();
                  setMode("edit");
                } finally {
                  setIsEditLoading(false);
                }
              }}
            />
          ) : (
            <ConfigSystemUpdateComp
              initialData={config}
              onCancel={() => setMode("view")}
              onSave={saveConfig}
            />
          )}
        </div>
      ) : null}
    </>
  );
}
