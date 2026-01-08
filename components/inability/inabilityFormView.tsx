// // components/inability/inabilityFormView.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm, SubmitHandler, Controller } from "react-hook-form";
// import toast from "react-hot-toast";
// import { Form } from "react-bootstrap"; // ✅

// import FormView, { FieldGroup } from "@/components/templates/FormView";
// import { Entry, FieldSelect } from "@/components/fields";
// import { useModals } from "@/context/ModalContext";

// import { createInability } from "@/app/actions/inability-actions";

// import { EmployeeAutocomplete, EmployeeLite } from "../configSystem/formUpdate";

// type TInputs = {
//   idEmployee: number | null;
//   disabilityCategory: string;
//   typeOfDisability: string;
//   dateInit: string;
//   dateEnd: string;
// };

// const toNum = (v: unknown): number | null => {
//   if (v === null || v === undefined || v === "") return null;
//   const n = Number(v);
//   return Number.isNaN(n) ? null : n;
// };

// export default function InabilityFormView({
//   employees,
// }: {
//   employees: EmployeeLite[];
// }) {
//   const router = useRouter();
//   const { modalError } = useModals();
//   const [saving, setSaving] = useState(false);

//   const {
//     control,
//     register,
//     handleSubmit,
//     reset,
//     formState: { isDirty },
//   } = useForm<TInputs>();

//   const originalValuesRef = useRef<TInputs | null>(null);

//   useEffect(() => {
//     const values: TInputs = {
//       idEmployee: null,
//       disabilityCategory: "Enfermedad general",
//       typeOfDisability: "Inicial",
//       dateInit: "",
//       dateEnd: "",
//     };
//     reset(values);
//     originalValuesRef.current = values;
//   }, [reset]);

//   const onSubmit: SubmitHandler<TInputs> = async (form) => {
//     try {
//       setSaving(true);

//       const payload = {
//         idEmployee: Number(form.idEmployee),
//         disabilityCategory: form.disabilityCategory,
//         typeOfDisability: form.typeOfDisability,
//         dateInit: form.dateInit,
//         dateEnd: form.dateEnd,
//       };

//       const res = await createInability(payload as never);
//       console.log("res: ", res);

//       if (!res.success) return modalError(res.message);

//       toast.success(res.message);
//       router.push("/app/inability?view_type=list&id=null");
//       router.refresh();
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Error inesperado";
//       modalError(message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <FormView
//       title="Incapacidad (Nuevo)"
//       cleanUrl="/app/inability?view_type=form&id=null"
//       id={0}
//       isDirty={isDirty}
//       disabled={saving}
//       reverse={() =>
//         originalValuesRef.current && reset(originalValuesRef.current)
//       }
//       onSubmit={handleSubmit(onSubmit)}
//       name={null}
//     >
//       <FieldGroup>
//         {/* ✅ Mismo estilo que tus otros forms */}
//         <Form.Group className="mb-3">
//           <Form.Label className="small text-muted">Empleado</Form.Label>

//           <Controller
//             control={control}
//             name="idEmployee"
//             rules={{ required: true }}
//             render={({ field }) => (
//               <EmployeeAutocomplete
//                 employees={employees as any}
//                 value={toNum(field.value) ?? 0}
//                 onChange={(id: number) => field.onChange(id || null)}
//                 onTouched={() => field.onBlur()}
//                 placeholder="Buscar empleado..."
//                 isEmployeesLoading={false}
//                 inputSize="sm" // 👈 (si agregas el cambio 2)
//                 inputClassName="text-uppercase" // 👈 (si agregas el cambio 2)
//               />
//             )}
//           />
//         </Form.Group>

//         <FieldSelect
//           label="Categoría:"
//           options={[
//             { label: "Enfermedad general", value: "Enfermedad general" },
//             { label: "Riesgo de trabajo", value: "Riesgo de trabajo" },
//             { label: "Maternidad", value: "Maternidad" },
//           ]}
//           register={register("disabilityCategory", { required: true })}
//         />

//         <FieldSelect
//           label="Tipo:"
//           options={[
//             { label: "Inicial", value: "Inicial" },
//             { label: "Subsecuente", value: "Subsecuente" },
//             { label: "Alta", value: "Alta" },
//           ]}
//           register={register("typeOfDisability", { required: true })}
//         />

//         <FieldGroup.Stack>
//           <Entry
//             label="Fecha inicio:"
//             type="date"
//             register={register("dateInit", { required: true })}
//           />
//           <Entry
//             label="Fecha fin:"
//             type="date"
//             register={register("dateEnd", { required: true })}
//           />
//         </FieldGroup.Stack>
//       </FieldGroup>
//     </FormView>
//   );
// }
