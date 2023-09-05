import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { differSchema, type DifferSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Diff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

export type State = "idle" | "loading" | "identical" | "different";

interface DifferRowFormProps {
  onSubmitRow: (data: DifferSchema) => Promise<void>;
  isFirstRow: boolean;
  isLastRow: boolean;
  onChange(values: DifferSchema): void;
  onPreview: () => void;
  values?: DifferSchema;
  state: State;
}

export const DifferRowForm = ({
  onSubmitRow,
  isFirstRow,
  isLastRow,
  onChange,
  onPreview,
  values,
  state,
}: DifferRowFormProps) => {
  const form = useForm({
    resolver: zodResolver(differSchema),
    mode: "onSubmit",
    values,
  });

  const onSubmit = async (data: DifferSchema): Promise<void> => {
    await onSubmitRow(data);
  };

  const showSubmit = state === "idle" || state === "loading";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-4 space-y-8"
        onChange={() => onChange(form.getValues())}
      >
        <fieldset className="grid grid-cols-[1fr,1fr,120px] gap-4">
          <FormField
            control={form.control}
            name="beforeUrl"
            render={({ field }) => (
              <FormItem>
                {isFirstRow && <FormLabel>Before URL</FormLabel>}
                <FormControl>
                  <Input
                    placeholder="https://"
                    {...field}
                    disabled={state !== "idle"}
                  />
                </FormControl>
                {isLastRow && (
                  <FormDescription>
                    Paste a comma-separated list of URLs. Separate multiple
                    entries with a new line.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="afterUrl"
            render={({ field }) => (
              <FormItem>
                {isFirstRow && <FormLabel>After URL</FormLabel>}
                <FormControl>
                  <Input
                    placeholder="https://"
                    {...field}
                    disabled={state !== "idle"}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className={cn({ "mt-8": isFirstRow })}>
            {state === "identical" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-green-600"
                onClick={onPreview}
                title="Identical, click to preview"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {state === "different" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600"
                onClick={onPreview}
                title="Different, click to preview"
              >
                <Diff className="h-4 w-4" />
              </Button>
            )}

            {showSubmit && (
              <Button
                type="submit"
                disabled={state === "loading"}
                variant="outline"
              >
                {state === "loading" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Differ
              </Button>
            )}
          </div>
        </fieldset>
      </form>
    </Form>
  );
};
