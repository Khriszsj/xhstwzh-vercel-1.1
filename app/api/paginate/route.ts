import { formatZodIssues, paginateRequestSchema } from "@/lib/api-schemas";
import { getTemplate } from "@/lib/defaults";
import { sanitizeRichDoc } from "@/lib/doc";
import { fail, ok } from "@/lib/http";
import { paginateDoc } from "@/lib/paginate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = paginateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return fail(formatZodIssues(parsed.error.issues), 422);
  }

  try {
    const template = getTemplate(parsed.data.templateId);
    const doc = sanitizeRichDoc(parsed.data.doc);

    const result = paginateDoc({
      doc,
      template,
      theme: parsed.data.themeVars
    });

    return ok({
      pages: result.pages,
      warnings: result.warnings
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to paginate", 500);
  }
}
