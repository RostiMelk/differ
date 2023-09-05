import { defineField, defineType } from "sanity";

export default defineType({
  name: "snapshot",
  title: "Snapshot",
  type: "document",
  fields: [
    defineField({
      name: "date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "visualDiff",
      type: "boolean",
    }),
    defineField({
      name: "metadataDiff",
      type: "boolean",
    }),
    defineField({
      name: "bodyDiff",
      type: "boolean",
    }),
    defineField({
      name: "diffImage",
      type: "image",
    }),
    defineField({
      name: "before",
      type: "snapshotObj",
    }),
    defineField({
      name: "after",
      type: "snapshotObj",
    }),
  ],
  preview: {
    select: {
      date: "date",
    },
    prepare(selection) {
      const date = selection?.date as string | undefined;
      const formattedDate = new Date(date ?? 0).toLocaleString("nb-NO", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      return {
        title: date ? formattedDate : "No date",
      };
    },
  },
});
