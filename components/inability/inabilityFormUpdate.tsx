// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm, SubmitHandler } from "react-hook-form";
// import toast from "react-hot-toast";

// import FormView, { FieldGroup } from "@/components/templates/FormView";
// import { Entry, FieldSelect } from "@/components/fields";
// import { useModals } from "@/context/ModalContext";

// import type { IInability, InabilityPayload } from "@/lib/definitions";
// import { updateInability } from "@/app/actions/inability-actions";

// type TInputs = InabilityPayload;

// export default function InabilityFormUpdate({
//   id,
//   inability,
// }: {
//   id: string;
//   inability: IInability;
// }) {
//   const router = useRouter();
//   const { modalError } = useModals();
//   const [saving, setSaving] = useState(false);

//   const { register, handleSubmit, reset, formState: { isDirty } } = useForm<TInputs>();
//   const originalValuesRef = useRef<TInputs | null>(null);

//   useEffect(() => {
//     // tomamos el primer documento para fechas (porque tu objeto real lo trae así)
//     const doc0 = inability.documentsInability?.[0];

//     const values: TInputs = {
//       idEmployee: Number(inability.idEmployee),
//       disabilityCategory: inability.disabilityCategory ?? "Enfermedad general",
//       typeOfDisability: inability.typeOfDisability ?? "Inicial",
//       dateInit: doc0?.dateInit ? String(doc0.dateInit).slice(0, 10) : "",
//       dateEnd: doc0?.dateEnd ? String(doc0.dateEnd).slice(0, 10) : "",
//     };

//     reset(values);
//     originalValuesRef.current = values;
//   }, [inability, reset]);

//   const handleReverse = () => {
//     if (originalValuesRef.current) reset(originalValuesRef.current);
//   };

//   const onSubmit: SubmitHandler<TInputs> = async (form) => {
//     try {
//       setSaving(true);

//       const idNum = Number(id);
//       if (Number.isNaN(idNum)) return modalError("ID inválido");

//       const payload: InabilityPayload = {
//         idEmployee: Number(form.idEmployee),
//         disabilityCategory: form.disabilityCategory,
//         typeOfDisability: form.typeOfDisability,
//         dateInit: form.dateInit,
//         dateEnd: form.dateEnd,
//       };

//       const res = await updateInability(idNum, payload);
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
//       title="Incapacidad (Actualizar)"
//       cleanUrl="/app/inability?view_type=form&id=null"
//       id={Number(id)}
//       isDirty={isDirty}
//       disabled={saving}
//       reverse={handleReverse}
//       onSubmit={handleSubmit(onSubmit)}
//       name={
//         inability.employee
//           ? `${inability.employee.name} ${inability.employee.lastName}`
//           : null
//       }
//     >
//       <FieldGroup>
//         <Entry
//           label="ID Empleado:"
//           type="number"
//           register={register("idEmployee", { valueAsNumber: true, required: true })}
//         />

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
//           <Entry label="Fecha inicio:" type="date" register={register("dateInit", { required: true })} />
//           <Entry label="Fecha fin:" type="date" register={register("dateEnd", { required: true })} />
//         </FieldGroup.Stack>
//       </FieldGroup>
//     </FormView>
//   );
// }
"use client";

// import { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm, SubmitHandler } from "react-hook-form";
// import toast from "react-hot-toast";

// import FormView, { FieldGroup } from "@/components/templates/FormView";
// import { Entry, FieldSelect } from "@/components/fields";
// import { useModals } from "@/context/ModalContext";

// import type { IInability, InabilityPayload } from "@/lib/definitions";
// import { updateInability } from "@/app/actions/inability-actions";

// type TInputs = InabilityPayload;

// export default function InabilityFormUpdate({
//   id,
//   inability,
// }: {
//   id: string;
//   inability: IInability;
// }) {
//   const router = useRouter();
//   const { modalError } = useModals();
//   const [saving, setSaving] = useState(false);

//   const { register, handleSubmit, reset, formState: { isDirty } } = useForm<TInputs>();
//   const originalValuesRef = useRef<TInputs | null>(null);

//   useEffect(() => {
//     // tomamos el primer documento para fechas (porque tu objeto real lo trae así)
//     const doc0 = inability.documentsInability?.[0];

//     const values: TInputs = {
//       idEmployee: Number(inability.idEmployee),
//       disabilityCategory: inability.disabilityCategory ?? "Enfermedad general",
//       typeOfDisability: inability.typeOfDisability ?? "Inicial",
//       dateInit: doc0?.dateInit ? String(doc0.dateInit).slice(0, 10) : "",
//       dateEnd: doc0?.dateEnd ? String(doc0.dateEnd).slice(0, 10) : "",
//     };

//     reset(values);
//     originalValuesRef.current = values;
//   }, [inability, reset]);

//   const handleReverse = () => {
//     if (originalValuesRef.current) reset(originalValuesRef.current);
//   };

//   const onSubmit: SubmitHandler<TInputs> = async (form) => {
//     try {
//       setSaving(true);

//       const idNum = Number(id);
//       if (Number.isNaN(idNum)) return modalError("ID inválido");

//       const payload: InabilityPayload = {
//         idEmployee: Number(form.idEmployee),
//         disabilityCategory: form.disabilityCategory,
//         typeOfDisability: form.typeOfDisability,
//         dateInit: form.dateInit,
//         dateEnd: form.dateEnd,
//       };

//       const res = await updateInability(idNum, payload);
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
//       title="Incapacidad (Actualizar)"
//       cleanUrl="/app/inability?view_type=form&id=null"
//       id={Number(id)}
//       isDirty={isDirty}
//       disabled={saving}
//       reverse={handleReverse}
//       onSubmit={handleSubmit(onSubmit)}
//       name={
//         inability.employee
//           ? `${inability.employee.name} ${inability.employee.lastName}`
//           : null
//       }
//     >
//       <FieldGroup>
//         <Entry
//           label="ID Empleado:"
//           type="number"
//           register={register("idEmployee", { valueAsNumber: true, required: true })}
//         />

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
//           <Entry label="Fecha inicio:" type="date" register={register("dateInit", { required: true })} />
//           <Entry label="Fecha fin:" type="date" register={register("dateEnd", { required: true })} />
//         </FieldGroup.Stack>
//       </FieldGroup>
//     </FormView>
//   );
// }
