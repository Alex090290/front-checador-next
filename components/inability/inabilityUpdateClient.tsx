// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import type { IInability } from "@/lib/definitions";
// import InabilityFormUpdate from "@/components/inability/inabilityFormUpdate";

// export default function InabilityUpdateClient({ id }: { id: string }) {
//   const router = useRouter();
//   const [row, setRow] = useState<IInability | null>(null);

//   const idNum = useMemo(() => Number(id), [id]);

//   useEffect(() => {
//     // si id es inválido, nos regresamos
//     if (id === "null" || Number.isNaN(idNum)) {
//       router.push("/app/inability?view_type=list&id=null");
//       return;
//     }

//     const raw = sessionStorage.getItem("inability_edit_row");
//     if (!raw) return;

//     try {
//       const parsed = JSON.parse(raw) as IInability;

//       // validación básica de que corresponde al id
//       if (Number(parsed?.id) === idNum) {
//         setRow(parsed);
//       }
//     } catch {
//       // ignore
//     }
//   }, [id, idNum, router]);

//   // Si no hay row (ej: recarga directa de la página update), puedes:
//   // 1) mostrar mensaje, o
//   // 2) redirigir a list, o
//   // 3) aquí sí hacer getOneInability como fallback (si algún día quieres robustez)
//   if (!row) {
//     return (
//       <div className="p-3">
//         <div className="text-muted mb-2">
//           No se encontró la información del registro (posible refresh o acceso directo).
//         </div>
//         <button
//           className="btn btn-primary"
//           onClick={() => router.push("/app/inability?view_type=list&id=null")}
//         >
//           Volver a lista
//         </button>
//       </div>
//     );
//   }

//   return <InabilityFormUpdate id={id} inability={row} />;
// }
