import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/badge";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import type { SanitySnapshotObj, GroqedImage } from "@/lib/types";
import { extractSEOMetadata } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
  const image = snapshot?.image as GroqedImage;

  return (
    <div>
      <Link href={url} passHref target="_blank">
        <Badge
          variant="secondary"
          className="sticky top-2 mx-auto mb-6 table cursor-pointer hover:bg-slate-200 focus:bg-slate-300"
        >
          {url.length > 50 ? url.substring(0, 50) + "..." : url}
          <ArrowRight className="ml-1 inline h-3 w-3" />
        </Badge>
      </Link>

      <Table className="mb-6">
        {Object.keys(metadataObj).map((key) => (
          <TableRow key={key}>
            <TableHead>{key}</TableHead>
            <TableCell>{metadataObj[key]}</TableCell>
          </TableRow>
        ))}
      </Table>

      {image && (
        <Image
          src={urlForImage(image).url()}
          alt="Before"
          className="w-full rounded-md border border-gray-200"
          placeholder="blur"
          blurDataURL={image.asset.metadata.lqip}
          width={image.asset.metadata.dimensions.width}
          height={image.asset.metadata.dimensions.height}
        />
      )}
    </div>
  );
};
