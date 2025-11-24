"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { Newsletter } from "@/lib/definitions";
import { formatDate } from "date-fns";

function NewsletterListView({ newsletters }: { newsletters: Newsletter[] }) {
  const colums: TableTemplateColumn<Newsletter>[] = [
    {
      key: "title",
      label: "Título",
      accessor: (row) => row.title,
      type: "string",
      filterable: true,
    },
    {
      key: "text",
      label: "Texto",
      accessor: (row) => row.text,
      type: "string",
    },
    {
      key: "dateInitiPublish",
      label: "Inicio",
      accessor: (row) => row.dateInitiPublish,
      type: "date",
      groupFormat: "yyyy-MM",
      render: (row) => (
        <div className="text-end">
          {row.dateInitiPublish
            ? formatDate(row.dateInitiPublish, "dd-MM-yyyy HH:mm")
            : null}
        </div>
      ),
    },
    {
      key: "dateEndPublish",
      label: "Final",
      accessor: (row) => row.dateEndPublish,
      type: "date",
      groupFormat: "yyyy-MM",
      render: (row) => (
        <div className="text-end">
          {row.dateEndPublish
            ? formatDate(row.dateEndPublish, "dd-MM-yyyy HH:mm")
            : null}
        </div>
      ),
    },
  ];

  return (
    <ListView>
      <ListView.Header
        title={`Anuncios (${newsletters.length ?? 0})`}
        formView="/app/newsletter?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          columns={colums}
          data={newsletters}
          getRowId={(row) => row.id}
          viewForm="/app/newsletter?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default NewsletterListView;
