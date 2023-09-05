import { useState } from "react";
import Head from "next/head";
import { DifferForm } from "@/components/DifferForm";
import { DifferPreview } from "@/components/DifferPreview";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [reRunRequest, setReRunRequest] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      <Head>
        <title>Differ</title>
      </Head>
      <header className="container py-16 text-center">
        <h1 className="text-5xl font-medium">Differ</h1>
        <p className="text-2xl font-light">
          A tool for comparing two web pages.
        </p>
      </header>

      <main className="container max-w-5xl">
        <DifferForm
          onPreview={(id) => id && setPreview(id)}
          onReRunInit={() => setReRunRequest(undefined)}
          reRunRequestId={reRunRequest}
        />
      </main>

      <Footer />

      {preview && (
        <DifferPreview
          id={preview}
          onClose={() => setPreview(undefined)}
          onReRun={(id) => setReRunRequest(id)}
        />
      )}
    </>
  );
}
