import { editorCommandRequestSchema, formatZodIssues } from "@/lib/api-schemas";
import { applyEditorOperations, sanitizeRichDoc } from "@/lib/doc";
import { fail, ok } from "@/lib/http";
import { parseEditorCommand } from "@/lib/command-engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = editorCommandRequestSchema.safeParse(body);

  if (!parsed.success) {
    return fail(formatZodIssues(parsed.error.issues), 422);
  }

  try {
    const doc = sanitizeRichDoc(parsed.data.doc);
    const result = parseEditorCommand(parsed.data.command, doc);

    if (!result.operations.length) {
      return ok({ result, patchedDoc: doc });
    }

    const patchedDoc = applyEditorOperations(doc, result.operations);
    return ok({ result, patchedDoc });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to parse command", 500);
  }
}
