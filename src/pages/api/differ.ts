import type { NextApiRequest, NextApiResponse } from "next";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { privateClient } from "@/sanity/lib/client";
import { differSchema } from "@/lib/types";
import looksSame from "looks-same";
import type {
  SanitySnapshot,
  SanitySnapshotObj,
  DifferResponse,
} from "@/lib/types";
import { extractSEOMetadata, isDeepEqual } from "@/lib/utils";

interface PuppeteerSnapshot {
  image: Buffer;
  /**
   * Metadata is <head> content, excluding <script> and <style> tags.
   */
  metadata: string;
  /**
   * Body is <body> content, excluding <script> and <style> tags.
   */
  body: string;
}

interface PuppeteerSnapshots {
  before: PuppeteerSnapshot;
  after: PuppeteerSnapshot;
}

export default async function differ(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = differSchema.parse(JSON.parse(req.body as string));
    const { beforeUrl, afterUrl } = data;

    console.info("Creating snapshot");
    const { _id } = await privateClient.create({
      _type: "snapshot",
      date: new Date().toISOString(),
    });

    console.info("Getting snapshot info");
    const { before, after } = await getSnapshot(beforeUrl, afterUrl);
    console.info("Got snapshot");

    // Compare everything
    console.info("Comparing snapshots");
    const compareRes = await compareImages(before.image, after.image);
    const metaIsEqual = await compareMetadata(before.metadata, after.metadata);
    const bodyIsEqual = compareBody(before.body, after.body);
    console.info("Compared snapshots");

    console.info("Saving snapshot");
    const createSnapshotObj = async (
      url: string,
      snapshot: PuppeteerSnapshot,
    ): Promise<SanitySnapshotObj> => {
      const image = await privateClient.assets.upload("image", snapshot.image);
      return {
        _type: "snapshotObj",
        url,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: image._id,
          },
        },
        metadata: snapshot.metadata,
        body: snapshot.body,
      };
    };

    if (compareRes.diffImage) {
      after.image = compareRes.diffImage;
      // Dispose of diff image buffer
      compareRes.diffImage = Buffer.from("");
    }

    const beforeObj = await createSnapshotObj(beforeUrl, before);
    const afterObj = await createSnapshotObj(afterUrl, after);

    // Dispose of image buffers
    before.image = Buffer.from("");
    after.image = Buffer.from("");

    await privateClient.createOrReplace({
      _id,
      _type: "snapshot",
      date: new Date().toISOString(),
      visualDiff: !compareRes.looksEqual,
      metadataDiff: !metaIsEqual,
      bodyDiff: !bodyIsEqual,
      before: beforeObj,
      after: afterObj,
    } satisfies SanitySnapshot);

    console.info("Saved snapshot");
    console.info("Done");

    return res.status(200).json({
      _id,
      message: "Success",
      bodyDiff: !bodyIsEqual,
      metadataDiff: !metaIsEqual,
      visualDiff: !compareRes.looksEqual,
    } satisfies DifferResponse);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad request", error });
  }
}

async function getSnapshot(
  beforeUrl: string,
  afterUrl: string,
): Promise<PuppeteerSnapshots> {
  // Options
  const imageOptions: Parameters<typeof page.screenshot>[0] = {
    fullPage: true,
    type: "jpeg",
    quality: 70,
  };
  const injectedStyle = `
    *,
    *::before,
    *::after {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      transition-delay: 0s !important;
      animation-delay: 0s !important;
    }
    svg * {
      animation: none !important;
    }
    [class*="osano"] {
      display: none !important;
    }
  `;

  // Init browser
  const isProd = process.env.NODE_ENV === "production";
  const browser = await puppeteer.launch({
    args: isProd ? chromium.args : undefined,
    executablePath: isProd ? await chromium.executablePath() : undefined,
    headless: true,
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const getSnapshotForUrl = async (url: string) => {
    await page.goto(url);

    const dynamicTimeout = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );
      return Math.max(Math.floor(height / 5), 3000);
    });

    await page.addStyleTag({ content: injectedStyle });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(dynamicTimeout);
    await page.evaluate(() => window.scrollTo(0, 0));
    const image = (await page.screenshot(imageOptions)) as Buffer;
    const html = await page.content();
    const metadata = extractMetadata(html);
    const body = extractBody(html);
    return { image, metadata, body };
  };

  const before = await getSnapshotForUrl(beforeUrl);
  const after = await getSnapshotForUrl(afterUrl);

  await context.close();
  await browser.close();

  return {
    before,
    after,
  };
}

// async function compareImages(
//   before: Buffer,
//   after: Buffer,
// ): Promise<{
//   looksEqual: boolean;
//   diffImage?: Buffer;
// }> {
//   const { equal, diffImage } = await looksSame(before, after, {
//     ignoreCaret: true,
//     ignoreAntialiasing: true,
//     createDiffImage: true,
//     tolerance: 10,
//   });
//   if (!diffImage) {
//     return { looksEqual: equal };
//   }
//   const diffImageBuffer = await diffImage?.createBuffer("png");
//   return { looksEqual: equal, diffImage: diffImageBuffer };
// }

async function compareImages(
  before: Buffer,
  after: Buffer,
): Promise<{
  looksEqual: boolean;
  diffImage?: Buffer;
}> {
  const options = {
    ignoreCaret: true,
    ignoreAntialiasing: true,
    tolerance: 50, // Account for jpg compression
  };
  const { equal } = await looksSame(before, after, options);

  if (equal) {
    return { looksEqual: equal };
  }

  const diffImage = await looksSame.createDiff({
    reference: before,
    current: after,
    highlightColor: "#ff00ffB3",
    ...options,
  });

  return { looksEqual: equal, diffImage };
}

async function compareMetadata(
  before: string,
  after: string,
): Promise<boolean> {
  const beforeMetadata = await extractSEOMetadata(before);
  const afterMetadata = await extractSEOMetadata(after);
  return isDeepEqual(beforeMetadata, afterMetadata);
}

function compareBody(before: string, after: string): boolean {
  return before === after;
}

function stripContent(html: string, tags: string[]): string {
  let result = html;
  tags.forEach((tag) => {
    const regex = new RegExp(`<${tag}.*?<\/${tag}>`, "gs");
    result = result.replace(regex, "");
  });
  return result;
}

function extractMetadata(html: string): string {
  return stripContent(html.match(/<head>(.*)<\/head>/s)?.[1] ?? "", [
    "script",
    "style",
  ]);
}

function extractBody(html: string): string {
  let body = stripContent(html.match(/<body.*?>(.*)<\/body>/s)?.[1] ?? "", [
    "script",
    "style",
    "iframe",
  ]);

  body = body
    .replace(/https?:\/\/[^/]+/g, "ANONYMOUS_HOSTNAME")
    .replace(/<!--.*?-->/gs, "")
    .replace(/id=".*?"/gs, 'id="ANONYMOUS_ID"')
    .replace(/aria-.*?by=".*?"/gs, 'aria-ANONYMOUS_BY="ANONYMOUS_ID"')
    .replace(/\s+/g, " ");

  return body;
}
