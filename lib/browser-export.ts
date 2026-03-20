"use client";

import { toBlob } from "html-to-image";
import JSZip from "jszip";

interface SuggestionsPayload {
  titles: string[];
  tags: string[];
}

interface ComplianceIssuePayload {
  word: string;
  count: number;
  suggestion: string;
}

function sanitizeFileName(name: string): string {
  const normalized = name.trim().replace(/\s+/g, "-");
  const safe = normalized.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "");
  return safe || "xiaohongshu-export";
}

function buildPageFileName(title: string, pageNo: number): string {
  return `${sanitizeFileName(title)}-${String(pageNo).padStart(3, "0")}.png`;
}

async function ensureFontsReady(): Promise<void> {
  if (!("fonts" in document)) {
    return;
  }

  try {
    await document.fonts.ready;
  } catch {
    // Ignore font readiness failures and continue with the current layout.
  }
}

function isMountedExportNode(node: HTMLElement | null | undefined): node is HTMLElement {
  return Boolean(
    node &&
    node.isConnected &&
    node.scrollWidth > 0 &&
    node.scrollHeight > 0
  );
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function resolveExportPageNode(input: {
  pageNo: number;
  node?: HTMLElement | null;
  getPageNode?: (pageNo: number) => HTMLElement | null;
  maxRetries?: number;
}): Promise<HTMLElement> {
  const maxRetries = Math.max(0, input.maxRetries ?? 3);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const candidate = input.getPageNode?.(input.pageNo) ?? input.node ?? null;
    if (isMountedExportNode(candidate)) {
      return candidate;
    }

    if (attempt < maxRetries) {
      await waitForNextFrame();
    }
  }

  throw new Error(`第 ${input.pageNo} 页导出节点尚未挂载完成，请稍后重试。`);
}

async function renderPageBlob(node: HTMLElement): Promise<Blob> {
  await ensureFontsReady();

  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 1,
    width: node.scrollWidth,
    height: node.scrollHeight,
    canvasWidth: node.scrollWidth,
    canvasHeight: node.scrollHeight
  });

  if (!blob) {
    throw new Error("页面导出失败，请重试。");
  }

  return blob;
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function buildPublishMarkdown(input: {
  title: string;
  suggestions: SuggestionsPayload;
}): string {
  return [
    `# ${input.title}`,
    "",
    "## 标题候选",
    ...(input.suggestions.titles.length
      ? input.suggestions.titles.map((item, index) => `${index + 1}. ${item}`)
      : ["1. 暂无建议标题"]),
    "",
    "## 标签建议",
    input.suggestions.tags.length ? input.suggestions.tags.join(" ") : "#小红书 #图文排版",
    "",
    "## 发布提示",
    "- 图片顺序已按编号导出。",
    "- 发布前请结合风险词提示再检查一遍内容。"
  ].join("\n");
}

export async function downloadCurrentPageAsPng(input: {
  node?: HTMLElement | null;
  getPageNode?: (pageNo: number) => HTMLElement | null;
  title: string;
  pageNo: number;
}): Promise<void> {
  const node = await resolveExportPageNode({
    pageNo: input.pageNo,
    node: input.node,
    getPageNode: input.getPageNode
  });
  const blob = await renderPageBlob(node);
  triggerBlobDownload(blob, buildPageFileName(input.title, input.pageNo));
}

export async function exportBundleAsZip(input: {
  title: string;
  templateId: string;
  pageCount: number;
  suggestions: SuggestionsPayload;
  complianceIssues: ComplianceIssuePayload[];
  getPageNode: (pageNo: number) => HTMLElement | null;
}): Promise<void> {
  const zip = new JSZip();

  for (let pageNo = 1; pageNo <= input.pageCount; pageNo += 1) {
    const node = await resolveExportPageNode({
      pageNo,
      getPageNode: input.getPageNode
    });
    const blob = await renderPageBlob(node);
    zip.file(buildPageFileName(input.title, pageNo), await blob.arrayBuffer());
  }

  zip.file("publish.md", buildPublishMarkdown({ title: input.title, suggestions: input.suggestions }));
  zip.file(
    "meta.json",
    JSON.stringify(
      {
        title: input.title,
        templateId: input.templateId,
        pageCount: input.pageCount,
        exportedAt: Date.now(),
        complianceIssues: input.complianceIssues
      },
      null,
      2
    )
  );

  const archiveBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(archiveBlob, `${sanitizeFileName(input.title)}-publish-bundle.zip`);
}
