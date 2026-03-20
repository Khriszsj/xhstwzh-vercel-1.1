# v1.5 Iteration Notes

## Summary

v1.5 is a stability-focused iteration that strengthens input validation, defensive sanitization, and export/render fault tolerance.
The goal is to keep the editor and API paths resilient under malformed payloads, weak network conditions, and edge-case layout parameters.

---

## What Changed

### 1. API Request Validation Hardened

All key API routes now use strict `zod` schemas with `safeParse` and unified `422` responses for invalid input.
This replaces the previous loose `z.custom` entry checks and prevents malformed data from reaching business logic.

Covered routes:
- `/api/paginate`
- `/api/editor/command`
- `/api/suggestions`
- `/api/compliance/check`

### 2. RichDoc Sanitization Becomes Defensive

`sanitizeRichDoc` now accepts unknown input and normalizes it with runtime guards.
Malformed nodes are filtered safely, required defaults are filled, and sanitization no longer throws for broken shapes.
This reduces 500-level failures from invalid request bodies.

### 3. Command Execution Error Handling Improved

The natural-language command request flow in `RichEditor` now handles:
- `fetch` failure
- non-JSON / broken JSON responses
- non-OK service statuses

User feedback now remains explicit and consistent instead of failing silently or surfacing unhandled promise errors.

### 4. Pagination and Serializer NaN-Protection

Image dimensions and key typography/layout inputs now use finite-number checks and clamping.
This blocks `NaN` propagation into page metrics and avoids unstable pagination under extreme or malformed values.

### 5. Export Timing Reliability

Export now retries across short frame windows when page nodes are not yet mounted.
If mounting is still incomplete after retries, the user receives a clear actionable error instead of a null-node failure.

---

## Compatibility

- Existing API paths and success response shapes remain unchanged.
- Session-only behavior and browser-side export architecture remain unchanged.
- Invalid request bodies are now rejected earlier with stricter `422` responses.

---

## Validation

- `npm run typecheck`
- `npm run build`

---

## Files Touched

- `app/api/paginate/route.ts`
- `app/api/editor/command/route.ts`
- `app/api/suggestions/route.ts`
- `app/api/compliance/check/route.ts`
- `app/page.tsx`
- `components/RichEditor.tsx`
- `components/editor-serializer.ts`
- `lib/api-schemas.ts`
- `lib/browser-export.ts`
- `lib/doc.ts`
- `lib/paginate.ts`
