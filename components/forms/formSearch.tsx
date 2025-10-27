"use client";
import { Button, Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type FormSearchInputs = {
  searchKey: string;
};

function FormSearch({
  listSearch,
  inputType = "text",
}: {
  listSearch: (key: string) => void;
  inputType: React.HTMLInputTypeAttribute;
}) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = useForm<FormSearchInputs>({
    defaultValues: {
      searchKey: "",
    },
  });

  const onSubmit: SubmitHandler<FormSearchInputs> = (data) => {
    listSearch(data.searchKey);
    setTimeout(() => {
      setFocus("searchKey");
    }, 100);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="d-flex" disabled={isSubmitting}>
        <Form.Control
          {...register("searchKey")}
          className="w-75"
          placeholder="Búsqueda..."
          autoComplete="off"
          type={inputType}
        />
        <Button size="sm" type="submit">
          <i className="bi bi-search"></i>
        </Button>
      </fieldset>
    </Form>
  );
}

export default FormSearch;
