import type { GetServerSideProps } from "next";
import { client } from "@/sanity/lib/client";
import { snapshotQuery } from "@/sanity/queries/snapshot";
import { type SanitySnapshot } from "@/lib/types";
import { Footer } from "@/components/Footer";
import { DifferPane } from "@/components/DifferPane";
import { DynamicHead } from "@/components/DynamicHead";

const Snapshot = ({ snapshot }: { snapshot: SanitySnapshot }) => {
  const visualDiff = snapshot?.visualDiff;
  const seoDiff = snapshot?.metadataDiff;
  const bodyDiff = snapshot?.bodyDiff;
  const formattedDate = new Date(snapshot?.date ?? 0).toLocaleString("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const descriptionArray = [
    visualDiff ? "Visually differs" : "Visually identical",
    seoDiff ? "SEO metadata differs" : "SEO metadata identical",
    bodyDiff ? "Semantic structure differs" : "Semantic structure identical",
    formattedDate,
  ];

  const hasErrDiff = visualDiff || seoDiff;

  return (
    <>
      <DynamicHead
        titleExtra={snapshot?._id}
        favicon={hasErrDiff ? "diff" : "equal"}
      />

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

export const getServerSideProps: GetServerSideProps = async (context) => {
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
