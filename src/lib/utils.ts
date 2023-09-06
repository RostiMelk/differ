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

export const isDeepEqual = (objA: unknown, objB: unknown): boolean => {
  // Both are of primitive type or are equal
  if (objA === objB) return true;

  // One of them is null or undefined
  if (!objA || !objB) return false;

  // One of them is not an object
  if (typeof objA !== "object" || typeof objB !== "object") return false;

  const keysA = Object.keys(objA as Record<string, unknown>);
  const keysB = Object.keys(objB as Record<string, unknown>);

  // Different number of keys
  if (keysA.length !== keysB.length) return false;

  // Compare values recursively
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
    if (
      !isDeepEqual(
        (objA as Record<string, unknown>)[key],
        (objB as Record<string, unknown>)[key],
      )
    )
      return false;
  }
  return true;
};
