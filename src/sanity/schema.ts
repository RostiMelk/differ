import { type SchemaTypeDefinition } from "sanity";
import snapshot from "./schemas/snapshot";
import snapshotObj from "./schemas/snapshotObj";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [snapshot, snapshotObj],
};
