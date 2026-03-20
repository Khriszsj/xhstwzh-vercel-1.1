import { createId } from "./id";
import type {
  Align,
  EditorOperation,
  RichDoc,
  TextMark,
  TextNode
} from "./types";

export function docToPlainText(doc: RichDoc): string {
  return doc.nodes
    .map((node) => {
      if (node.type === "image") {
        return "[图片]";
      }

      return node.children
        .map((inline) => {
          if (inline.type === "hardBreak") {
            return "\n";
          }
          return inline.text;
        })
        .join("");
    })
    .join("\n\n");
}

export function applyEditorOperations(doc: RichDoc, operations: EditorOperation[]): RichDoc {
  const cloned = structuredClone(doc);

  for (const op of operations) {
    const node = cloned.nodes[op.paragraphIndex];
    if (!node || node.type !== "paragraph") {
      continue;
    }

    if (op.type === "appendHardBreak") {
      node.children.push({ type: "hardBreak", id: createId("br") });
      continue;
    }

    if (op.type === "setParagraphSpacing") {
      const spacing = Number(op.payload?.spacing ?? 14);
      node.spacingAfter = Number.isNaN(spacing) ? 14 : spacing;
      continue;
    }

    const mutator = (textNode: TextNode, marks: Partial<TextMark>) => {
      textNode.marks = {
        ...textNode.marks,
        ...marks
      };
    };

    if (op.type === "setParagraphMark") {
      const bold = Boolean(op.payload?.bold);
      node.children.forEach((child) => {
        if (child.type === "text") {
          mutator(child, { bold });
        }
      });
      continue;
    }

    if (op.type === "setParagraphTextColor") {
      const color = String(op.payload?.color ?? "#111827");
      node.children.forEach((child) => {
        if (child.type === "text") {
          mutator(child, { color });
        }
      });
      continue;
    }

    if (op.type === "setParagraphFontSize") {
      const fontSize = Number(op.payload?.fontSize ?? 36);
      node.children.forEach((child) => {
        if (child.type === "text") {
          mutator(child, { fontSize });
        }
      });
    }
  }

  cloned.updatedAt = Date.now();
  return cloned;
}

export function applyGlobalTextColor(doc: RichDoc, color: string): RichDoc {
  return {
    ...doc,
    nodes: doc.nodes.map((node) => {
      if (node.type === "image") {
        return node;
      }

      return {
        ...node,
        children: node.children.map((child) => {
          if (child.type === "hardBreak") {
            return child;
          }

          return {
            ...child,
            marks: {
              ...child.marks,
              color
            }
          };
        })
      };
    }),
    updatedAt: Date.now()
  };
}

export function sanitizeRichDoc(input: unknown): RichDoc {
  const now = Date.now();
  const source = asRecord(input);
  // 这里不信任任何外部输入，逐层收缩为可安全消费的 RichDoc。
  const rawNodes = Array.isArray(source?.nodes) ? source.nodes : [];
  const nodes = rawNodes
    .map((node) => sanitizeDocNode(node))
    .filter((node): node is RichDoc["nodes"][number] => node !== null);

  return {
    id: getNonEmptyString(source?.id) ?? createId("doc"),
    title: typeof source?.title === "string" ? source.title : "未命名笔记",
    nodes: nodes.length ? nodes : [createFallbackParagraph()],
    updatedAt: now
  };
}

function sanitizeDocNode(input: unknown): RichDoc["nodes"][number] | null {
  const node = asRecord(input);
  if (!node || typeof node.type !== "string") {
    return null;
  }

  if (node.type === "image") {
    const assetId = getNonEmptyString(node.assetId);
    const src = getNonEmptyString(node.src);
    const width = getFiniteNumber(node.width);
    const height = getFiniteNumber(node.height);

    if (!assetId || !src || width === null || height === null || width <= 0 || height <= 0) {
      return null;
    }

    return {
      type: "image",
      id: getNonEmptyString(node.id) ?? createId("img"),
      assetId,
      src,
      width,
      height,
      align: normalizeRequiredAlign(node.align, "center"),
      caption: typeof node.caption === "string" ? node.caption : undefined
    };
  }

  if (node.type !== "paragraph") {
    return null;
  }

  const children = (Array.isArray(node.children) ? node.children : [])
    .map((child) => sanitizeInlineNode(child))
    .filter((child): child is NonNullable<ReturnType<typeof sanitizeInlineNode>> => child !== null);

  const hasContent = children.some((child) => child.type === "hardBreak" || child.text.length > 0);
  if (!hasContent) {
    return null;
  }

  return {
    type: "paragraph",
    id: getNonEmptyString(node.id) ?? createId("para"),
    children,
    spacingAfter: getFiniteNumber(node.spacingAfter) ?? 14,
    textAlign: normalizeOptionalAlign(node.textAlign)
  };
}

function sanitizeInlineNode(input: unknown) {
  const node = asRecord(input);
  if (!node || typeof node.type !== "string") {
    return null;
  }

  if (node.type === "hardBreak") {
    return {
      type: "hardBreak" as const,
      id: getNonEmptyString(node.id) ?? createId("br")
    };
  }

  if (node.type !== "text") {
    return null;
  }

  return {
    type: "text" as const,
    id: getNonEmptyString(node.id) ?? createId("txt"),
    text: typeof node.text === "string" ? node.text : "",
    marks: normalizeMarks(node.marks)
  };
}

function normalizeMarks(marks: unknown): TextMark | undefined {
  const source = asRecord(marks);
  if (!source) {
    return undefined;
  }

  const output: TextMark = {};

  if (source.bold === true) {
    output.bold = true;
  }
  if (typeof source.color === "string" && source.color.length > 0) {
    output.color = source.color;
  }
  if (typeof source.fontSize === "number" && Number.isFinite(source.fontSize)) {
    output.fontSize = source.fontSize;
  }
  if (typeof source.lineHeight === "number" && Number.isFinite(source.lineHeight)) {
    output.lineHeight = Math.max(1, Math.min(3, source.lineHeight));
  }
  if (typeof source.letterSpacing === "number" && Number.isFinite(source.letterSpacing)) {
    output.letterSpacing = Math.max(-4, Math.min(24, source.letterSpacing));
  }
  if (typeof source.paddingInline === "number" && Number.isFinite(source.paddingInline)) {
    output.paddingInline = Math.max(0, Math.min(120, source.paddingInline));
  }

  return Object.keys(output).length ? output : undefined;
}

function createFallbackParagraph(): RichDoc["nodes"][number] {
  return {
    type: "paragraph",
    id: createId("para"),
    children: [
      {
        type: "text",
        id: createId("txt"),
        text: ""
      }
    ],
    spacingAfter: 14
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function getNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeOptionalAlign(value: unknown): Align | undefined {
  if (value === "left" || value === "center" || value === "right") {
    return value;
  }
  return undefined;
}

function normalizeRequiredAlign(value: unknown, fallback: Align): Align {
  if (value === "left" || value === "center" || value === "right") {
    return value;
  }
  return fallback;
}
