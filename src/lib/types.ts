import * as z from "zod";
import type { Image } from "sanity";

export const differSchema = z.object({
  beforeUrl: z.string().url(),
  afterUrl: z.string().url(),
});

export type DifferSchema = z.infer<typeof differSchema>;

export interface SanitySnapshotObj {
  _type: "snapshotObj";
  url?: string;
  image?: Image;
  metadata?: string;
  body?: string;
}

export interface SanitySnapshot {
  _id: string;
  _type: "snapshot";
  date?: string;
  visualDiff?: boolean;
  metadataDiff?: boolean;
  bodyDiff?: boolean;
  before?: SanitySnapshotObj;
  after?: SanitySnapshotObj;
}

export interface DifferResponse {
  _id: string;
  bodyDiff: boolean;
  message: string;
  metadataDiff: boolean;
  visualDiff: boolean;
}
