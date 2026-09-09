"use client";

import { hourClock } from "@/lib/helpers";
import { useState, useEffect, useRef } from "react";

function Clock() {
  const [clock, setClock] = useState<string>("00:00 --");
  const [showColon, setShowColon] = useState<boolean>(true);
  const offsetRef = useRef<number>(0); // diferencia servidor - cliente, en ms

  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const t0 = Date.now();
        const res = await fetch("/api/server-time", { cache: "no-store" });
        const t1 = Date.now();
        const { now } = await res.json();
        const roundTrip = t1 - t0;
        offsetRef.current = now + roundTrip / 2 - t1;
      } catch (err) {
        console.error("No se pudo sincronizar la hora con el servidor", err);
      }
    };

    syncWithServer();
    const resyncId = setInterval(syncWithServer, 5 * 60 * 1000); // re-sincroniza cada 5 min

    const intervalId = setInterval(() => {
      const serverNow = new Date(Date.now() + offsetRef.current);
      setClock(hourClock(serverNow));
      setShowColon((prev) => !prev);
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(resyncId);
    };
  }, []);

  return (
    <>
      {clock.split(":")[0]}
      <span style={{ visibility: showColon ? "visible" : "hidden" }}>:</span>
      {clock.split(":")[1]}
    </>
  );
}

export default Clock;