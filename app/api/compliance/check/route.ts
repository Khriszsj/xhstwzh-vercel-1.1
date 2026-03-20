import { complianceCheckRequestSchema, formatZodIssues } from "@/lib/api-schemas";
import { checkCompliance } from "@/lib/compliance";
import { sanitizeRichDoc } from "@/lib/doc";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = complianceCheckRequestSchema.safeParse(body);

  if (!parsed.success) {
    return fail(formatZodIssues(parsed.error.issues), 422);
  }

  try {
    const issues = checkCompliance(sanitizeRichDoc(parsed.data.doc));
    return ok({ issues });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Compliance check failed", 500);
  }
}
