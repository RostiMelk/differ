import { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type SanitySnapshot } from "@/lib/types";
import { DifferPane } from "@/components/DifferPane";
import { snapshotQuery } from "@/sanity/queries/snapshot";
import { ExternalLink, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DifferPreview {
  id: string;
  onClose: () => void;
  onReRun: (id: string) => void;
}

const getDiffer = async (id: string) => {
  const result: SanitySnapshot | undefined = await client.fetch(snapshotQuery, {
    id,
  });
  return result;
};

export const DifferPreview = ({ id, onClose, onReRun }: DifferPreview) => {
  const [differ, setDiffer] = useState<SanitySnapshot | undefined>(undefined);

  useEffect(() => {
    getDiffer(id)
      .then((differ) => setDiffer(differ))
      .catch(console.error);
  }, [id]);

  const visualDiff = differ?.visualDiff;
  const seoDiff = differ?.metadataDiff;
  const bodyDiff = differ?.bodyDiff;
  const formattedDate = new Date(differ?.date).toLocaleString("nb-NO", {
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] xl:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Differ preview</DialogTitle>
          <DialogDescription>{descriptionArray.join(" · ")}</DialogDescription>
        </DialogHeader>

        {differ && (
          <div className="grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto">
            <DifferPane snapshot={differ.before} />
            <DifferPane snapshot={differ.after} />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onReRun(id);
              onClose();
            }}
          >
            <Redo className="mr-2 h-4 w-4" />
            Re-run
          </Button>

          <Link href={`/${id}`} target="_blank">
            <Button variant="secondary" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in new tab
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
