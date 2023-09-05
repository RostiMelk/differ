import { defineField, defineType } from "sanity";

export default defineType({
  name: "snapshotObj",
  title: "Snapshot",
  type: "object",
  fields: [
    defineField({
      name: "url",
      type: "url",
    }),
    defineField({
      name: "image",
      type: "image",
    }),
    defineField({
      name: "metadata",
      type: "text",
    }),
    defineField({
      name: "body",
      type: "text",
    }),
  ],
  preview: {
    select: {
      url: "url",
    },
    prepare(selection) {
      return {
        title: selection?.url || "No URL",
      };
    },
  },
});
