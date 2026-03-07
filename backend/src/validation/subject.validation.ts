import { z } from "zod";

const resourceLinkSchema = z.object({
  label: z.string().min(1, "Label is required").max(80),
  url: z
    .string()
    .url("Invalid URL")
    .refine(
      (u) => u.startsWith("http://") || u.startsWith("https://"),
      "URL must use http or https",
    ),
});

const resourceLinksArray = z
  .array(resourceLinkSchema)
  .max(20, "At most 20 resource links allowed");

/** Validate subject-level and topic-level resourceLinks in a subject payload. */
export function validateSubjectResourceLinks(body: {
  resourceLinks?: unknown;
  chapters?: Array< { topics?: Array< { resourceLinks?: unknown } > } >;
}): void {
  if (body.resourceLinks != null) {
    resourceLinksArray.parse(body.resourceLinks);
  }
  body.chapters?.forEach((ch) => {
    ch.topics?.forEach((t) => {
      if (t.resourceLinks != null) {
        resourceLinksArray.parse(t.resourceLinks);
      }
    });
  });
}
