import { formatZodIssues, suggestionsRequestSchema } from "@/lib/api-schemas";
import { sanitizeRichDoc } from "@/lib/doc";
import { fail, ok } from "@/lib/http";
import { buildSuggestions } from "@/lib/suggestions";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = suggestionsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return fail(formatZodIssues(parsed.error.issues), 422);
  }

  try {
    const suggestions = buildSuggestions(sanitizeRichDoc(parsed.data.doc));
    return ok(suggestions);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to build suggestions", 500);
  }
}
