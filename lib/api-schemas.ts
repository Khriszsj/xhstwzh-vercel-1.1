import { z } from "zod";

// API 入口统一使用严格 schema，避免 z.custom 让畸形结构漏进业务层。
const alignSchema = z.enum(["left", "center", "right"]);
const skinStyleSchema = z.enum([
  "plain",
  "glassmorphism",
  "scrapbook",
  "magazine",
  "chat",
  "gradient",
  "highlight-card",
  "candy-card-yellow",
  "candy-card-blue"
]);

const finiteNumber = z.number().finite();

export const textMarkSchema = z.object({
  bold: z.boolean().optional(),
  color: z.string().min(1).optional(),
  fontSize: finiteNumber.optional(),
  lineHeight: finiteNumber.optional(),
  letterSpacing: finiteNumber.optional(),
  paddingInline: finiteNumber.optional()
}).strict();

export const textNodeSchema = z.object({
  type: z.literal("text"),
  id: z.string().min(1),
  text: z.string(),
  marks: textMarkSchema.optional()
}).strict();

export const hardBreakNodeSchema = z.object({
  type: z.literal("hardBreak"),
  id: z.string().min(1)
}).strict();

export const inlineNodeSchema = z.discriminatedUnion("type", [
  textNodeSchema,
  hardBreakNodeSchema
]);

export const paragraphNodeSchema = z.object({
  type: z.literal("paragraph"),
  id: z.string().min(1),
  children: z.array(inlineNodeSchema),
  spacingAfter: finiteNumber.optional(),
  textAlign: alignSchema.optional()
}).strict();

export const imageNodeSchema = z.object({
  type: z.literal("image"),
  id: z.string().min(1),
  assetId: z.string().min(1),
  src: z.string().min(1),
  width: finiteNumber,
  height: finiteNumber,
  align: alignSchema,
  caption: z.string().optional()
}).strict();

export const docNodeSchema = z.discriminatedUnion("type", [
  paragraphNodeSchema,
  imageNodeSchema
]);

export const richDocSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  nodes: z.array(docNodeSchema),
  updatedAt: finiteNumber
}).strict();

export const themeVarsSchema = z.object({
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  pageBackground: z.string().min(1),
  textColor: z.string().min(1),
  accentColor: z.string().min(1),
  fontFamily: z.string().min(1),
  bodyFontSize: finiteNumber,
  bodyLineHeight: finiteNumber,
  pagePaddingTop: finiteNumber,
  pagePaddingRight: finiteNumber,
  pagePaddingBottom: finiteNumber,
  pagePaddingLeft: finiteNumber,
  footerSignature: z.string(),
  imageStylePreset: z.string().min(1).optional(),
  skinStyle: skinStyleSchema.optional()
}).strict();

export const paginateRequestSchema = z.object({
  templateId: z.string().min(1).optional(),
  themeVars: themeVarsSchema,
  doc: richDocSchema
}).strict();

export const editorCommandRequestSchema = z.object({
  command: z.string().min(1),
  doc: richDocSchema
}).strict();

export const suggestionsRequestSchema = z.object({
  doc: richDocSchema
}).strict();

export const complianceCheckRequestSchema = z.object({
  doc: richDocSchema
}).strict();

export function formatZodIssues(issues: z.ZodIssue[]): string {
  return issues.map((item) => item.message).join("; ");
}
