"use client";

import { createNewsletter } from "@/app/actions/newsletter-actions";
import { Entry } from "@/components/fields";
import { ImageField } from "@/components/fields/ImageField";
import FormView, { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Newsletter } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  img: string | null;
  title: string;
  text: string;
  dateInitiPublish: string;
  hourInitiPublish: string;
  dateEndPublish: string;
  hourEndPublish: string;
};

function NewsletterFormView({
  id,
  newsletter,
}: {
  id: string;
  newsletter: Newsletter | null;
}) {
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<TInputs>();

  const [fechaInicio] = watch(["dateInitiPublish", "hourInitiPublish"]);

  const { modalError } = useModals();

  const router = useRouter();

  const originalValuesRef = useRef<TInputs | null>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (id && id === "null") {
      const res = await createNewsletter({ data });

      if (!res.success) return modalError(res.message);

      toast.success(res.message);
      router.back();
    } else {
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!newsletter) {
      const values: TInputs = {
        title: "",
        text: "",
        img: null,
        dateEndPublish: "",
        dateInitiPublish: "",
        hourEndPublish: "",
        hourInitiPublish: "",
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        title: newsletter.title,
        text: newsletter.text,
        img: newsletter.img || null,
        dateEndPublish: newsletter.dateEndPublish
          ? formatDate(newsletter.dateEndPublish, "yyyy-MM-dd")
          : "",
        dateInitiPublish: newsletter.dateInitiPublish
          ? formatDate(newsletter.dateInitiPublish, "yyyy-MM-dd")
          : "",
        hourEndPublish: newsletter.dateEndPublish
          ? formatDate(newsletter.dateEndPublish, "HH:mm")
          : "",
        hourInitiPublish: newsletter.dateInitiPublish
          ? formatDate(newsletter.dateInitiPublish, "HH:mm")
          : "",
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, newsletter]);

  return (
    <FormView
      name={newsletter?.title || null}
      reverse={handleReverse}
      onSubmit={handleSubmit(onSubmit)}
      id={Number(id)}
      isDirty={isDirty}
      disabled={isSubmitting}
      cleanUrl="/app/newsletter?view_type=form&id=null"
    >
      <FieldGroup>
        <Entry
          label="Título"
          register={register("title", { required: true })}
        />
        <Entry
          label="Descripción"
          as="textarea"
          rows={8}
          register={register("text")}
        />
        <FieldGroup.Stack>
          <Entry
            label="Fecha inicio"
            register={register("dateInitiPublish")}
            type="date"
            min={formatDate(new Date(), "yyyy-MM-dd")}
          />
          <Entry
            label="Fecha final"
            register={register("dateEndPublish")}
            type="date"
            min={fechaInicio}
            readonly={!fechaInicio}
          />
        </FieldGroup.Stack>
        <FieldGroup.Stack>
          <Entry
            label="Hora inicio"
            register={register("hourInitiPublish")}
            type="time"
          />
          <Entry
            label="Hora final"
            register={register("hourEndPublish")}
            type="time"
          />
        </FieldGroup.Stack>
        <div className="text-center">
          <ImageField
            {...register("img")}
            height={0}
            width={450}
            control={control}
          />
        </div>
      </FieldGroup>
    </FormView>
  );
}

export default NewsletterFormView;
