import Image from "next/image";
import { useState, useEffect } from "react";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/badge";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import type { SanitySnapshotObj } from "@/lib/types";
import { extractSEOMetadata } from "@/lib/utils";

interface DifferPaneProps {
  snapshot?: SanitySnapshotObj;
}

export const DifferPane = ({ snapshot }: DifferPaneProps) => {
  const [metadataObj, setMetadataObj] = useState<Record<string, string>>({});

  useEffect(() => {
    extractSEOMetadata(snapshot?.metadata)
      .then((res) => setMetadataObj(res))
      .catch(console.error);
  }, [snapshot?.metadata]);

  if (!snapshot) return null;

  const url = snapshot?.url ?? "";

  return (
    <div>
      <Badge variant="secondary" className="sticky top-2 mx-auto mb-6 table">
        {url.length > 50 ? url.substring(0, 50) + "..." : url}
      </Badge>

      <Table className="mb-6">
        {Object.keys(metadataObj).map((key) => (
          <TableRow key={key}>
            <TableHead>{key}</TableHead>
            <TableCell>{metadataObj[key]}</TableCell>
          </TableRow>
        ))}
      </Table>

      {snapshot?.image && (
        <Image
          src={urlForImage(snapshot?.image).url()}
          alt="Before"
          className="w-full rounded-md border border-gray-200"
          placeholder="blur"
          blurDataURL={snapshot?.image.asset.metadata.lqip}
          width={snapshot?.image.asset.metadata.dimensions.width}
          height={snapshot?.image.asset.metadata.dimensions.height}
        />
      )}
    </div>
  );
};
