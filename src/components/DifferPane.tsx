import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/badge";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import type { SanitySnapshotObj, GroqedImage } from "@/lib/types";
import { extractSEOMetadata } from "@/lib/utils";
import { ArrowRight, Crop } from "lucide-react";

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

  const MAX_IMAGE_HEIGHT = 8192;

  const limitedImageHeight = Math.min(
    image.asset.metadata.dimensions.height,
    MAX_IMAGE_HEIGHT,
  );

  return (
    <div>
      <Link href={url} passHref target="_blank">
        <Badge
          variant="secondary"
          className="sticky top-2 mx-auto mb-4 table cursor-pointer hover:bg-slate-200 focus:bg-slate-300"
        >
          {url.length > 50 ? url.substring(0, 50) + "..." : url}
          <ArrowRight className="ml-1 inline h-3 w-3" />
        </Badge>
      </Link>
      {image && (
        <div className="overflow-hidden rounded-md border border-slate-200">
          {Array.from(
            {
              length: Math.ceil(
                image.asset.metadata.dimensions.height / MAX_IMAGE_HEIGHT,
              ),
            },
            (_, i) => i * MAX_IMAGE_HEIGHT,
          ).map((offset) => (
            <Image
              key={offset}
              src={
                urlForImage(image)
                  .width(image.asset.metadata.dimensions.width)
                  .height(limitedImageHeight)
                  .rect(
                    0,
                    offset,
                    image.asset.metadata.dimensions.width,
                    Math.min(
                      image.asset.metadata.dimensions.height - offset,
                      MAX_IMAGE_HEIGHT,
                    ),
                  )
                  .url() ?? ""
              }
              alt={`screen shot of ${url}, offset ${offset}`}
              placeholder="blur"
              blurDataURL={image.asset.metadata.lqip}
              width={image.asset.metadata.dimensions.width}
              height={limitedImageHeight}
              loading="eager"
            />
          ))}
        </div>
      )}
      <h3 className="mb-2 mt-6 text-xl font-medium">SEO Metadata</h3>
      <Table className="mb-6 [overflow-wrap:anywhere]">
        {Object.keys(metadataObj).map((key) => (
          <TableRow key={key}>
            <TableHead className="[text-wrap:nowrap]">{key}</TableHead>
            <TableCell className="[text-wrap:balance]">
              {metadataObj[key]}
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
};
