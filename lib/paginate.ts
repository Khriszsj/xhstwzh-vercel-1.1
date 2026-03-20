import { createId } from "./id";
import type {
  Align,
  InlineNode,
  PageImageItem,
  PageItem,
  PageLineItem,
  PageRender,
  PaginationResult,
  ParagraphNode,
  RichDoc,
  Template,
  TextMark,
  TextRun,
  ThemeVars
} from "./types";

export type CharMeasurer = (char: string, fontSize: number, bold: boolean, letterSpacing: number) => number;

interface PreparedLine {
  runs: TextRun[];
  lineHeight: number;
  textAlign?: Align;
  justifySpacing?: number;
}

interface MeasureContext {
  contentWidth: number;
  baseFontSize: number;
  lineHeightRatio: number;
}

const MIN_CONTENT_SIZE = 1;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 160;
const MIN_LINE_HEIGHT_RATIO = 1;
const MAX_LINE_HEIGHT_RATIO = 3;
const MIN_LETTER_SPACING = -8;
const MAX_LETTER_SPACING = 40;
const MIN_IMAGE_SIZE = 40;
const MAX_SPACING_AFTER = 240;

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizeContentSize(value: unknown): number {
  return Math.max(MIN_CONTENT_SIZE, Math.round(toFiniteNumber(value, MIN_CONTENT_SIZE)));
}

function sanitizeFontSize(value: unknown, fallback: number): number {
  return clampNumber(toFiniteNumber(value, fallback), MIN_FONT_SIZE, MAX_FONT_SIZE);
}

function sanitizeLineHeightRatio(value: unknown, fallback: number): number {
  return clampNumber(
    Number(toFiniteNumber(value, fallback).toFixed(3)),
    MIN_LINE_HEIGHT_RATIO,
    MAX_LINE_HEIGHT_RATIO
  );
}

function sanitizeLetterSpacing(value: unknown, fallback: number): number {
  return clampNumber(
    Number(toFiniteNumber(value, fallback).toFixed(2)),
    MIN_LETTER_SPACING,
    MAX_LETTER_SPACING
  );
}

function sanitizeSpacingAfter(value: unknown, fallback = 14): number {
  return clampNumber(Math.round(toFiniteNumber(value, fallback)), 0, MAX_SPACING_AFTER);
}

function sanitizeImageDimension(value: unknown): number {
  return Math.max(MIN_IMAGE_SIZE, Math.round(toFiniteNumber(value, MIN_IMAGE_SIZE)));
}

function isCjk(char: string): boolean {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(char);
}

function isEmoji(char: string): boolean {
  return /\p{Extended_Pictographic}/u.test(char);
}

function measureCharWidth(char: string, fontSize: number, bold = false, letterSpacing = 0): number {
  const safeFontSize = sanitizeFontSize(fontSize, 36);
  const safeLetterSpacing = sanitizeLetterSpacing(letterSpacing, 0);
  let width = safeFontSize * 0.62;

  if (char === "\t") {
    width = safeFontSize * 1.6;
  } else if (char === " ") {
    width = safeFontSize * 0.42;
  } else if (isEmoji(char)) {
    width = safeFontSize * 1.08;
  } else if (isCjk(char)) {
    width = safeFontSize * 1.04;
  } else {
    width = safeFontSize * 0.62;
  }

  if (bold) {
    width *= 1.06;
  }

  width += safeLetterSpacing;

  // Keep a small safety margin so the browser doesn't second-wrap a line.
  return width * 1.04;
}

function marksEqual(a?: TextMark, b?: TextMark): boolean {
  return (a?.bold ?? false) === (b?.bold ?? false) &&
    (a?.color ?? "") === (b?.color ?? "") &&
    (a?.fontSize ?? 0) === (b?.fontSize ?? 0) &&
    (a?.lineHeight ?? 0) === (b?.lineHeight ?? 0) &&
    (a?.letterSpacing ?? 0) === (b?.letterSpacing ?? 0) &&
    (a?.paddingInline ?? 0) === (b?.paddingInline ?? 0);
}

function makeLineFromRuns(runs: TextRun[], lineHeight: number, textAlign?: Align, justifySpacing?: number): PreparedLine {
  return {
    runs,
    lineHeight: Math.max(20, lineHeight),
    textAlign,
    justifySpacing
  };
}

function pushChar(
  runs: TextRun[],
  char: string,
  marks: TextMark | undefined
): TextRun[] {
  if (!runs.length) {
    runs.push({ text: char, marks });
    return runs;
  }

  const last = runs[runs.length - 1];
  if (marksEqual(last.marks, marks)) {
    last.text += char;
    return runs;
  }

  runs.push({ text: char, marks });
  return runs;
}

function countChars(runs: TextRun[]): number {
  let count = 0;
  for (const run of runs) {
    count += [...run.text].length;
  }
  return count;
}

function paragraphToLines(node: ParagraphNode, ctx: MeasureContext, measureChar?: CharMeasurer): PreparedLine[] {
  const lines: PreparedLine[] = [];
  const contentWidth = sanitizeContentSize(ctx.contentWidth);
  const baseFontSize = sanitizeFontSize(ctx.baseFontSize, 36);
  const baseLineHeightRatio = sanitizeLineHeightRatio(ctx.lineHeightRatio, 1.6);
  let runs: TextRun[] = [];
  let lineWidth = 0;
  let maxLineHeight = Math.max(20, Math.round(baseFontSize * baseLineHeightRatio));
  const textAlign = node.textAlign;

  const flushLine = (forceEmpty = false, overflow = false): void => {
    if (!runs.length && !forceEmpty) {
      return;
    }

    const lineRuns = runs.length ? runs : [{ text: "", marks: { fontSize: baseFontSize } }];

    // For overflow-wrapped lines: distribute remaining gap across characters
    let justifySpacing: number | undefined;
    if (overflow && lineRuns.length > 0) {
      const charCount = countChars(lineRuns);
      if (charCount > 1) {
        const gap = contentWidth - lineWidth;
        // Only justify if the gap is small (< 1 full char width) — avoids
        // spreading huge gaps on very short lines
        if (gap > 0 && gap < baseFontSize * 1.2) {
          justifySpacing = Number((gap / (charCount - 1)).toFixed(3));
        }
      }
    }

    lines.push(makeLineFromRuns(lineRuns, maxLineHeight, textAlign, justifySpacing));

    runs = [];
    lineWidth = 0;
    maxLineHeight = Math.max(20, Math.round(baseFontSize * baseLineHeightRatio));
  };

  const processTextNode = (inline: InlineNode): void => {
    if (inline.type !== "text") {
      return;
    }

    const source = inline.text;
    for (const char of source) {
      if (char === "\r") {
        continue;
      }

      if (char === "\n") {
        flushLine(true, false);
        continue;
      }

      const fontSize = sanitizeFontSize(inline.marks?.fontSize, baseFontSize);
      const letterSpacing = sanitizeLetterSpacing(inline.marks?.letterSpacing, 0);
      const measuredWidth = measureChar
        ? measureChar(char, fontSize, inline.marks?.bold ?? false, letterSpacing)
        : measureCharWidth(char, fontSize, inline.marks?.bold, letterSpacing);
      const width = Math.max(
        0,
        toFiniteNumber(measuredWidth, measureCharWidth(char, fontSize, inline.marks?.bold, letterSpacing))
      );
      const lineHeightRatio = sanitizeLineHeightRatio(inline.marks?.lineHeight, baseLineHeightRatio);

      if (lineWidth + width > contentWidth && lineWidth > 0) {
        flushLine(false, true); // overflow = true → this line is "full"
      }

      pushChar(runs, char, inline.marks);
      lineWidth += width;
      maxLineHeight = Math.max(maxLineHeight, Math.round(fontSize * lineHeightRatio));
    }
  };

  for (const inline of node.children) {
    if (inline.type === "hardBreak") {
      flushLine(true, false);
      continue;
    }

    processTextNode(inline);
  }

  // Last line of a paragraph — never justify (like CSS text-align: justify)
  flushLine(false, false);
  return lines;
}

function createEmptyPage(pageNo: number): PageRender {
  return {
    pageNo,
    usedHeight: 0,
    items: []
  };
}

export function paginateDoc(params: {
  doc: RichDoc;
  template: Template;
  theme: ThemeVars;
  measureChar?: CharMeasurer;
}): PaginationResult {
  const { doc, template, theme, measureChar } = params;
  const warnings: string[] = [];

  const canvasWidth = sanitizeContentSize(template.canvasWidth);
  const canvasHeight = sanitizeContentSize(template.canvasHeight);
  const pagePaddingLeft = Math.max(0, toFiniteNumber(theme.pagePaddingLeft, 0));
  const pagePaddingRight = Math.max(0, toFiniteNumber(theme.pagePaddingRight, 0));
  const pagePaddingTop = Math.max(0, toFiniteNumber(theme.pagePaddingTop, 0));
  const pagePaddingBottom = Math.max(0, toFiniteNumber(theme.pagePaddingBottom, 0));
  const baseFontSize = sanitizeFontSize(theme.bodyFontSize, 36);
  const bodyLineHeight = sanitizeLineHeightRatio(theme.bodyLineHeight, 1.6);

  const rawContentWidth = canvasWidth - pagePaddingLeft - pagePaddingRight;
  const rawContentHeight = canvasHeight - pagePaddingTop - pagePaddingBottom;
  const contentWidth = sanitizeContentSize(rawContentWidth);
  const contentHeight = sanitizeContentSize(rawContentHeight);

  if (rawContentWidth <= 0 || rawContentHeight <= 0) {
    warnings.push("页面留白参数异常，已自动回退为最小可排版区域。");
  }

  const pages: PageRender[] = [createEmptyPage(1)];
  let currentPage = pages[0];
  const pageFirstNodeId: Record<number, string> = {};

  const pushItem = (item: PageItem, height: number, forceNewPage = true): void => {
    if (
      currentPage.usedHeight + height > contentHeight &&
      currentPage.items.length > 0 &&
      forceNewPage
    ) {
      currentPage = createEmptyPage(pages.length + 1);
      pages.push(currentPage);
    }

    currentPage.items.push(item);
    currentPage.usedHeight += height;
  };

  for (const node of doc.nodes) {
    // Record first node for each page before processing
    if (!pageFirstNodeId[currentPage.pageNo]) {
      pageFirstNodeId[currentPage.pageNo] = node.id;
    }

    if (node.type === "paragraph") {
      const lines = paragraphToLines(node, {
        contentWidth,
        baseFontSize,
        lineHeightRatio: bodyLineHeight
      }, measureChar);

      for (const line of lines) {
        const lineItem: PageLineItem = {
          type: "line",
          id: createId("line"),
          runs: line.runs,
          lineHeight: line.lineHeight,
          textAlign: line.textAlign,
          justifySpacing: line.justifySpacing
        };
        pushItem(lineItem, line.lineHeight, true);
      }

      const spacing = sanitizeSpacingAfter(node.spacingAfter, 14);
      if (spacing > 0) {
        pushItem(
          {
            type: "spacer",
            id: createId("spacer"),
            height: spacing
          },
          spacing,
          true
        );
      }
      // If a new page was created during paragraph processing, this node is its first
      if (!pageFirstNodeId[currentPage.pageNo]) {
        pageFirstNodeId[currentPage.pageNo] = node.id;
      }
      continue;
    }

    const sourceWidth = sanitizeImageDimension(node.width);
    const sourceHeight = sanitizeImageDimension(node.height);
    const widthScale = Math.min(1, contentWidth / Math.max(MIN_CONTENT_SIZE, sourceWidth));
    let renderWidth = Math.max(1, Math.round(sourceWidth * widthScale));
    let renderHeight = Math.max(1, Math.round(sourceHeight * widthScale));

    if (renderHeight > contentHeight) {
      const hScale = contentHeight / renderHeight;
      renderWidth = Math.max(1, Math.floor(renderWidth * hScale));
      renderHeight = Math.max(1, Math.floor(renderHeight * hScale));
      warnings.push(`图片 ${node.id} 超高，已自动缩放到单页最大高度`);
    }

    if (currentPage.usedHeight + renderHeight > contentHeight && currentPage.items.length > 0) {
      currentPage = createEmptyPage(pages.length + 1);
      pages.push(currentPage);
    }

    const imageItem: PageImageItem = {
      type: "image",
      id: createId("imgitem"),
      assetId: node.assetId,
      src: node.src,
      width: renderWidth,
      height: renderHeight,
      align: node.align,
      caption: node.caption
    };

    pushItem(imageItem, renderHeight, false);
    pushItem(
      {
        type: "spacer",
        id: createId("spacer"),
        height: 18
      },
      18,
      true
    );
    // If a new page was created during processing, this node is its first
    if (!pageFirstNodeId[currentPage.pageNo]) {
      pageFirstNodeId[currentPage.pageNo] = node.id;
    }
  }

  return {
    pages,
    warnings,
    pageFirstNodeId
  };
}
