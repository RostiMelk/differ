import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractSEOMetadata = async (htmlString?: string) => {
  if (!htmlString) return {};

  let doc: Document | undefined;
  if (typeof window === "undefined") {
    const { JSDOM } = await import("jsdom");
    const { document } = new JSDOM(htmlString).window;
    doc = document;
  } else {
    const parser = new DOMParser();
    doc = parser.parseFromString(htmlString, "text/html");
  }

  const metadata: Record<string, string> = {
    title: doc.title,
  };

  const metaTags = doc.querySelectorAll("meta");
  metaTags.forEach((meta) => {
    const property = meta.getAttribute("property") ?? meta.getAttribute("name");
    if (property?.startsWith("og:")) {
      metadata[property] = meta.getAttribute("content") ?? "";
    }
  });

  const sortedMetadata: Record<string, string> = {};
  Object.keys(metadata)
    .sort()
    .forEach((key) => {
      sortedMetadata[key] = metadata[key] ?? "";
    });

  return sortedMetadata;
};
