import { useEffect, useState } from "react";
import { DifferRowForm } from "@/components/DifferFormRow";
import { Button } from "@/components/ui/button";
import {
  type DifferSchema,
  differSchema,
  type DifferResponse,
} from "@/lib/types";

interface DifferFormProps {
  onPreview?: (id?: string) => void;
  onReRunInit?: () => void;
  reRunRequestId?: string;
}

export const DifferForm = ({
  reRunRequestId,
  onPreview,
  onReRunInit,
}: DifferFormProps) => {
  const [rows, setRows] = useState<number>(1);
  const [allFormValues, setAllFormValues] = useState<DifferSchema[]>([]);

  const handleAllSubmit = async (): Promise<void> => {};

  const checkIfAllFieldsFilled = (values: DifferSchema) => {
    return Object.values(values).every(
      (val) => val !== "" && val !== null && val !== undefined,
    );
  };

  /**
   * Handles pasted values from the idx-th row.
   */
  const handlePastedValues = (pastedLines: string, idx: number) => {
    const values: DifferSchema[] = pastedLines
      .replace(/,\s+/g, " ")
      .split(" ")
      .map((url, index, array) => {
        if (index % 2 === 0) {
          const values = {
            beforeUrl: url.trim(),
            afterUrl: array[index + 1]?.trim() ?? undefined,
          };

          try {
            differSchema.parse(values);
          } catch (error) {
            return null;
          }

          return values;
        }
      })
      .filter((value): value is DifferSchema => value != null);

    const newAllFormValues = [...allFormValues];
    newAllFormValues.splice(idx, 0, ...values);
    setAllFormValues(newAllFormValues);
    setRows(newAllFormValues.length + 1);
  };

  // useEffect(() => {
  //   if (!reRunRequestId) return;

  //   const idx = forms.findIndex((form) => form.id === reRunRequestId);
  //   const newIdx = forms.length - 1;
  //   const { beforeUrl, afterUrl } = allFormValues[idx]!;

  //   setForms((forms) => [...forms, { state: "idle" }]);
  //   setAllFormValues((allFormValues) => [
  //     ...allFormValues,
  //     { beforeUrl, afterUrl },
  //   ]);
  //   onReRunInit?.();
  //   handleFormSubmit({ beforeUrl, afterUrl }, newIdx).catch(console.error);
  // }, [reRunRequestId]);

  return (
    <div>
      {Array.from({ length: rows }).map((_, idx) => (
        <DifferRowForm
          key={idx}
          isFirstRow={idx === 0}
          isLastRow={idx === rows - 1}
          onPreview={(id) => onPreview?.(id)}
          values={allFormValues[idx] ?? {}}
          onChanges={(values) => {
            if (values.beforeUrl?.includes(",")) {
              handlePastedValues(values.beforeUrl, idx);
              return;
            }

            const newAllFormValues = [...allFormValues];
            newAllFormValues[idx] = values;
            setAllFormValues(newAllFormValues);

            console.log(values);

            if (checkIfAllFieldsFilled(values)) {
              setRows((rows) => rows + 1);
            }
          }}
        />
      ))}

      <footer className="mt-14 flex items-center gap-4">
        <Button type="submit" onClick={handleAllSubmit}>
          Differ everything
        </Button>
        <p className="text-sm text-gray-500">This will take a while.</p>
      </footer>
    </div>
  );
};
