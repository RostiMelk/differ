import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DifferRowForm, type State } from "@/components/DifferFormRow";
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

interface FormState {
  id?: string;
  state: State;
}

export const DifferForm = ({
  reRunRequestId,
  onPreview,
  onReRunInit,
}: DifferFormProps) => {
  const [forms, setForms] = useState<FormState[]>([{ state: "idle" }]);
  const [allFormValues, setAllFormValues] = useState<DifferSchema[]>([]);
  const formCount = forms.length;

  const setFormState = (idx: number, state: FormState) => {
    setForms((forms) => {
      const newForms = [...forms];
      newForms[idx] = { ...newForms[idx], ...state };
      return newForms;
    });
  };

  const handleFormSubmit = async (
    data: DifferSchema,
    idx: number,
  ): Promise<void> => {
    setFormState(idx, { state: "loading" });
    const response = await fetch("/api/differ", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      setFormState(idx, { state: "error" });
      return;
    }

    const { _id, visualDiff, metadataDiff } =
      (await response.json()) as DifferResponse;

    // avoid diff on html, since this is mostly used as a warning
    const newState = visualDiff || metadataDiff ? "different" : "identical";
    setFormState(idx, { id: _id, state: newState });
  };

  const handleAllSubmit = async (): Promise<void> => {
    setForms(
      forms.map((form, idx) => ({
        ...form,
        state:
          allFormValues[idx]?.beforeUrl &&
          allFormValues[idx]?.afterUrl &&
          form.state === "idle"
            ? "loading"
            : form.state,
      })),
    );

    for (let i = 0; i < formCount; i++) {
      const data = allFormValues[i];
      if (!data || !forms[i]) continue;
      if (forms[i]?.state === "idle") {
        await handleFormSubmit(data, i);
      }
    }
  };

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

    const newForms = [...forms];
    newForms.splice(idx, 0, ...values.map(() => ({ state: "idle" as State })));
    setForms(newForms);
  };

  useEffect(() => {
    if (!reRunRequestId) return;

    const idx = forms.findIndex((form) => form.id === reRunRequestId);
    const newIdx = forms.length - 1;
    const { beforeUrl, afterUrl } = allFormValues[idx]!;

    setForms((forms) => [...forms, { state: "idle" }]);
    setAllFormValues((allFormValues) => [
      ...allFormValues,
      { beforeUrl, afterUrl },
    ]);
    onReRunInit?.();
    handleFormSubmit({ beforeUrl, afterUrl }, newIdx).catch(console.error);
  }, [reRunRequestId]);

  return (
    <div>
      {Array.from({ length: formCount }).map((_, idx) => (
        <DifferRowForm
          key={idx}
          onSubmitRow={(data) => handleFormSubmit(data, idx)}
          isFirstRow={idx === 0}
          isLastRow={idx === formCount - 1}
          values={allFormValues[idx]}
          onPreview={() => onPreview?.(forms[idx]?.id)}
          state={forms[idx]?.state ?? "idle"}
          onChange={(values: DifferSchema) => {
            // check if includes comma or newline
            if (values.beforeUrl.includes(",")) {
              handlePastedValues(values.beforeUrl, idx);
            } else {
              const newAllFormValues = [...allFormValues];
              newAllFormValues[idx] = values;
              setAllFormValues(newAllFormValues);

              // If it's the last form and all its fields are filled out, then add a new row.
              if (idx === formCount - 1 && checkIfAllFieldsFilled(values)) {
                setForms([...forms, { state: "idle" }]);
              }
            }
          }}
        />
      ))}

      <footer className="mt-14 flex items-center gap-4">
        <Button
          type="submit"
          disabled={forms.some((form) => form.state === "loading")}
          onClick={handleAllSubmit}
        >
          {forms.every((form) => form.state === "loading") && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Differ everything
        </Button>
        <p className="text-sm text-gray-500">This will take a while.</p>
      </footer>
    </div>
  );
};
