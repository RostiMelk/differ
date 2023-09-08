import { useState, useEffect } from "react";
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
import {
  differSchema,
  type DifferSchema,
  type DifferResponse,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  ServerCrash,
  ImageIcon,
  ImageOff,
  SearchCheck,
  SearchX,
  Equal,
  EqualNot,
} from "lucide-react";
import { useForm } from "react-hook-form";

type State = "idle" | "loading" | "finished" | "error";

interface DifferRowFormProps {
  onSubmit?: (values: DifferSchema) => void;
  isFirstRow?: boolean;
  isLastRow?: boolean;
  onPreview: (id?: string) => void;
  onChanges?: (values: DifferSchema) => void;
  values: DifferSchema | Record<string, never>;
}

export const DifferRowForm = ({
  onSubmit,
  isFirstRow,
  isLastRow,
  onPreview,
  onChanges,
  values,
}: DifferRowFormProps) => {
  const [state, setState] = useState<State>("idle");
  const [response, setResponse] = useState<DifferResponse | null>(null);
  const form = useForm({
    resolver: zodResolver(differSchema),
    mode: "onSubmit",
    values,
  });

  const showSubmit = state === "idle" || state === "loading";
  const numberOfDiffs = [
    response?.visualDiff,
    response?.metadataDiff,
    response?.bodyDiff,
  ].filter(Boolean).length;

  const handleFormSubmit = async (): Promise<void> => {
    if (state === "loading" || state === "finished") return;
    setState("loading");
    onSubmit?.(values);
    console.log(values);
    const response = await fetch("/api/differ", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    setResponse((await response.json()) as DifferResponse);
    setState("finished");
  };

  console.log(response);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="mb-4 space-y-8"
        onChange={() => {
          onChanges?.(form.getValues() as DifferSchema);
        }}
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
            {state === "finished" && (
              <Button
                type="button"
                variant="ghost"
                className={cn("gap-1", {
                  "text-green-600": numberOfDiffs === 0,
                  "text-amber-500": numberOfDiffs === 1,
                  "text-red-600": numberOfDiffs >= 2,
                })}
                onClick={() => onPreview?.(response?._id)}
                title="Click to preview"
              >
                {response?.visualDiff ? (
                  <ImageOff className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
                {response?.metadataDiff ? (
                  <SearchX className="h-5 w-5" />
                ) : (
                  <SearchCheck className="h-5 w-5" />
                )}
                {response?.bodyDiff ? (
                  <EqualNot className="h-5 w-5" />
                ) : (
                  <Equal className="h-5 w-5" />
                )}
              </Button>
            )}

            {state === "error" && (
              <Button
                type="submit"
                variant="outline"
                className="text-red-600"
                title="Server error, click to retry"
              >
                <ServerCrash className="mr-2 h-4 w-4" />
                Retry
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
