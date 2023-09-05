import type { GetStaticPaths, GetStaticProps } from "next";
import { client } from "@/sanity/lib/client";
import { allSnapshotIds, snapshotQuery } from "@/sanity/queries/snapshot";
import { type SanitySnapshot } from "@/lib/types";
import { Footer } from "@/components/Footer";
import { DifferPane } from "@/components/DifferPane";
import Head from "next/head";

const Snapshot = ({ snapshot }: { snapshot: SanitySnapshot }) => {
  const visualDiff = snapshot?.visualDiff;
  const seoDiff = snapshot?.metadataDiff;
  const bodyDiff = snapshot?.bodyDiff;
  const formattedDate = new Date(snapshot?.date).toLocaleString("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const descriptionArray = [
    visualDiff ? "Visually differs" : "Visually identical",
    seoDiff ? "SEO metadata differs" : "SEO metadata identical",
    bodyDiff ? "Semantic structure differs" : "Semantic structure identical",
    formattedDate,
  ];

  return (
    <>
      <Head>
        <title>Differ | {snapshot?._id}</title>
      </Head>

      <header className=" container my-12">
        <h1 className="mb-4 text-4xl font-medium">Differ View</h1>
        <p className="text-sm font-light">{descriptionArray.join(" · ")}</p>
      </header>

      <main className="container">
        <div className="grid grid-cols-2 gap-4 overflow-y-auto">
          <DifferPane snapshot={snapshot.before} />
          <DifferPane snapshot={snapshot.after} />
        </div>
      </main>

      <Footer />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: string[] = await client.fetch(allSnapshotIds);

  return {
    paths: paths.map((id) => ({ params: { id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id = "" } = context.params ?? {};
  const snapshot: SanitySnapshot = await client.fetch(snapshotQuery, { id });

  if (!snapshot) {
    return { notFound: true };
  }

  return {
    props: {
      snapshot,
    },
  };
};

export default Snapshot;
