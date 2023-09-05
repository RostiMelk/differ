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
import { extractSEOMetadata } from "@/lib/utils";

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

    const { _id } = await privateClient.create({
      _type: "snapshot",
      date: new Date().toISOString(),
    });

    const { before, after } = await getSnapshot(beforeUrl, afterUrl);

    // Compare everything
    const looksEqual = await compareImages(before.image, after.image);
    const metaIsEqual = compareMetadata(before.metadata, after.metadata);
    const bodyIsEqual = compareBody(before.body, after.body);

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

    const beforeObj = await createSnapshotObj(beforeUrl, before);
    const afterObj = await createSnapshotObj(afterUrl, after);

    await privateClient.createOrReplace({
      _id,
      _type: "snapshot",
      date: new Date().toISOString(),
      visualDiff: !looksEqual,
      metadataDiff: !metaIsEqual,
      bodyDiff: !bodyIsEqual,
      before: beforeObj,
      after: afterObj,
    } satisfies SanitySnapshot);

    return res.status(200).json({
      _id,
      message: "Success",
      bodyDiff: !bodyIsEqual,
      metadataDiff: !metaIsEqual,
      visualDiff: !looksEqual,
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
    quality: 90,
  };
  const timeout = 3000;

  // Init browser
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath()),
    headless: true,
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const getSnapshotForUrl = async (url: string) => {
    await page.goto(url);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(timeout);
    await page.evaluate(() => window.scrollTo(0, 0));
    const image = (await page.screenshot(imageOptions)) as Buffer;
    const html = await page.content();
    const metadata = extractMetadata(html);
    const body = extractBody(html);
    return { image, metadata, body };
  };

  const before = await getSnapshotForUrl(beforeUrl);
  const after = await getSnapshotForUrl(afterUrl);

  await browser.close();

  return {
    before,
    after,
  };
}

async function compareImages(before: Buffer, after: Buffer): Promise<boolean> {
  const { equal } = await looksSame(before, after);
  return equal;
}

function compareMetadata(before: string, after: string): boolean {
  const beforeMetadata = extractSEOMetadata(before);
  const afterMetadata = extractSEOMetadata(after);
  return Object.keys(beforeMetadata).every(
    // @ts-expect-error We know that types are the same
    (key) => beforeMetadata[key] === afterMetadata[key],
  );
}

function compareBody(before: string, after: string): boolean {
  return before === after;
}

function extractMetadata(html: string): string {
  const metadata = html.match(/<head>(.*)<\/head>/s)?.[1] ?? "";
  const metadataWithoutScripts = metadata.replace(/<script.*?<\/script>/gs, "");
  const metadataWithoutStyles = metadataWithoutScripts.replace(
    /<style.*?<\/style>/gs,
    "",
  );
  return metadataWithoutStyles;
}

function extractBody(html: string): string {
  const body = html.match(/<body.*?>(.*)<\/body>/s)?.[1] ?? "";
  const bodyWithoutScripts = body.replace(/<script.*?<\/script>/gs, "");
  const bodyWithoutStyles = bodyWithoutScripts.replace(
    /<style.*?<\/style>/gs,
    "",
  );
  return bodyWithoutStyles;
}
