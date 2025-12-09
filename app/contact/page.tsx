"use client";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import { useState } from "react";
import schema from "./schema.json";
import uischema from "./ui-schema.json";
import { Button } from "@mui/material";

const renderers = [...materialRenderers];

export default function ContactPage() {
  const [data, setData] = useState<any>({});
  const [schemaErrors, setSchemaErrors] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted data:", data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="w-[500px] mx-auto p-5 bg-white rounded-md shadow-sm">
        <form onSubmit={handleSubmit}>
          <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={renderers}
            cells={materialCells}
            onChange={({ data, errors }) => {
              setData(data);
              setSchemaErrors(errors || []);
            }}
          />
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                if (confirm("Are you sure you want to cancel?")) {
                  setData({});
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={schemaErrors.length > 0}
              variant="contained"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
