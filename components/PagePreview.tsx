"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import type { PageRender, Template, TextRun, ThemeVars } from "@/lib/types";

const useMeasureEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface PagePreviewProps {
  template: Template;
  theme: ThemeVars;
  pages: PageRender[];
  compact?: boolean;
  selectedPageNo?: number;
  onSelectPage?: (pageNo: number) => void;
  onDownloadPage?: (pageNo: number) => void;
}

function runStyle(theme: ThemeVars, run: TextRun): CSSProperties {
  const paddingInline = run.marks?.paddingInline ?? 0;
  return {
    whiteSpace: "pre",
    fontWeight: run.marks?.bold ? 700 : 400,
    color: run.marks?.color || theme.textColor,
    fontSize: `${run.marks?.fontSize || theme.bodyFontSize}px`,
    lineHeight: run.marks?.lineHeight ? String(run.marks.lineHeight) : undefined,
    letterSpacing:
      run.marks?.letterSpacing || run.marks?.letterSpacing === 0
        ? `${run.marks.letterSpacing}px`
        : undefined,
    paddingLeft: paddingInline ? `${paddingInline}px` : undefined,
    paddingRight: paddingInline ? `${paddingInline}px` : undefined,
    display: paddingInline ? "inline-block" : undefined
  };
}

function useScale(widthRef: RefObject<HTMLDivElement | null>, template: Template): number {
  const [width, setWidth] = useState(360);

  useMeasureEffect(() => {
    const element = widthRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      setWidth(element.clientWidth);
    };

    update();

    const observer = new ResizeObserver(() => {
      update();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [widthRef]);

  return useMemo(() => {
    if (!template.canvasWidth) {
      return 1;
    }
    return Math.max(0.1, Math.min(1, width / template.canvasWidth));
  }, [template.canvasWidth, width]);
}

function resolveAssetSrc(src: string): string {
  const safeSrc = (src || "").trim();
  if (!safeSrc) {
    return "";
  }

  if (safeSrc.startsWith("/api/assets/")) {
    return safeSrc.split("?")[0];
  }

  return safeSrc;
}

function PreviewImage(props: {
  src: string;
  width: number;
  height: number;
}) {
  const { src, width, height } = props;

  return (
    // Data URLs and browser-side export use a plain img element intentionally.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveAssetSrc(src)}
      alt=""
      loading="eager"
      style={{
        width,
        height,
        objectFit: "contain",
        borderRadius: 10,
        display: "block"
      }}
    />
  );
}

export function PageCanvas(props: {
  page: PageRender;
  scale: number;
  template: Template;
  theme: ThemeVars;
  mini?: boolean;
}) {
  const { page, scale, template, theme, mini } = props;

  return (
    <div
      className="xhs-preview-page"
      style={{
        height: `${template.canvasHeight * scale}px`
      }}
    >
      <div
        style={{
          width: `${template.canvasWidth}px`,
          height: `${template.canvasHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background: theme.pageBackground,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
          position: "absolute",
          left: 0,
          top: 0,
          borderRadius: mini ? 14 : 20,
          overflow: "hidden",
          border: mini ? "1px solid rgba(15,23,42,0.08)" : undefined
        }}
      >
        {theme.skinStyle === 'glassmorphism' && (
          <div style={{ position: 'absolute', inset: 40, borderRadius: 32, background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.65)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)', zIndex: 0 }} />
        )}
        {theme.skinStyle === 'scrapbook' && (
          <>
            <div style={{ position: 'absolute', inset: '60px 48px 80px 48px', background: '#fffcf9', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 35, left: '50%', transform: 'translateX(-50%) rotate(-3deg)', width: 140, height: 40, background: 'rgba(238,223,204,0.95)', mixBlendMode: 'multiply', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', zIndex: 0 }} />
          </>
        )}
        {theme.skinStyle === 'magazine' && (
          <>
            <div style={{ position: 'absolute', inset: 60, border: '2px solid #d4d4d4', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontSize: 16, letterSpacing: 8, color: '#999', zIndex: 0, fontFamily: 'serif' }}>ISSUE / EDITORIAL MINIMAL</div>
          </>
        )}
        {theme.skinStyle === 'highlight-card' && (
          <>
            <div style={{ position: 'absolute', inset: '40px 32px 40px 32px', background: '#ffffff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 0 }} />
          </>
        )}
        {(theme.skinStyle === 'candy-card-yellow' || theme.skinStyle === 'candy-card-blue') && (
          <>
            <div style={{ position: 'absolute', inset: '48px 40px 48px 40px', background: '#ffffff', borderRadius: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '2px solid rgba(255,255,255,0.5)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 20, right: 40, fontSize: 48, zIndex: 0 }}>{theme.skinStyle === 'candy-card-yellow' ? '🌼' : '☀️'}</div>
            <div style={{ position: 'absolute', bottom: 20, left: 40, fontSize: 48, zIndex: 0 }}>{theme.skinStyle === 'candy-card-yellow' ? '🐾' : '🐱'}</div>
          </>
        )}
        <div
          className="xhs-preview-content"
          style={{
            paddingTop: theme.pagePaddingTop,
            paddingRight: theme.pagePaddingRight,
            paddingBottom: theme.pagePaddingBottom,
            paddingLeft: theme.pagePaddingLeft,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1
          }}
        >
          {page.items.map((item) => {
            if (item.type === "spacer") {
              return <div key={item.id} style={{ height: item.height }} />;
            }

            if (item.type === "image") {
              const justifyContent =
                item.align === "left"
                  ? "flex-start"
                  : item.align === "right"
                    ? "flex-end"
                    : "center";

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent,
                    width: "100%"
                  }}
                >
                  <PreviewImage src={item.src} width={item.width} height={item.height} />
                </div>
              );
            }

            return (
              <div
                key={item.id}
                style={{
                  minHeight: item.lineHeight,
                  lineHeight: `${item.lineHeight}px`,
                  fontSize: `${theme.bodyFontSize}px`,
                  whiteSpace: "pre",
                  overflow: "hidden"
                }}
              >
                {item.runs.map((run, index) => (
                  <span key={`${item.id}-${index}`} style={runStyle(theme, run)}>
                    {run.text}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            right: theme.pagePaddingRight,
            bottom: 28,
            color: theme.secondaryColor,
            fontSize: 24,
            zIndex: 1
          }}
        >
          {theme.footerSignature}
        </div>
      </div>
    </div>
  );
}

export function PagePreview({
  template,
  theme,
  pages,
  compact,
  selectedPageNo,
  onSelectPage,
  onDownloadPage
}: PagePreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scale = useScale(containerRef, template);

  if (!pages.length) {
    return (
      <div className="panel">
        <div className="panel-header">
          <strong>分页预览</strong>
        </div>
        <div className="preview-list">暂无内容</div>
      </div>
    );
  }

  const selected = pages.find((item) => item.pageNo === selectedPageNo) ?? pages[0];

  if (compact) {
    const selectedIndex = pages.findIndex((item) => item.pageNo === selected.pageNo);
    const previousPage = selectedIndex > 0 ? pages[selectedIndex - 1] : null;
    const nextPage =
      selectedIndex >= 0 && selectedIndex < pages.length - 1 ? pages[selectedIndex + 1] : null;

    return (
      <div className="panel preview-compact">
        <div className="panel-header">
          <strong>预览</strong>
          <button
            type="button"
            onClick={() => {
              onDownloadPage?.(selected.pageNo);
            }}
          >
            下载当前页
          </button>
        </div>

        <div className="preview-main" ref={containerRef}>
          <PageCanvas page={selected} scale={scale} template={template} theme={theme} />
        </div>

        <div className="preview-pager">
          <button
            type="button"
            disabled={!previousPage}
            onClick={() => {
              if (previousPage) {
                onSelectPage?.(previousPage.pageNo);
              }
            }}
          >
            上一页
          </button>
          <span>
            第 {selected.pageNo} / {pages.length} 页
          </span>
          <button
            type="button"
            disabled={!nextPage}
            onClick={() => {
              if (nextPage) {
                onSelectPage?.(nextPage.pageNo);
              }
            }}
          >
            下一页
          </button>
        </div>

        <div className="preview-mini-strip">
          {pages.map((page) => (
            <button
              key={page.pageNo}
              type="button"
              className={`preview-mini-item ${selected.pageNo === page.pageNo ? "is-active" : ""}`}
              onClick={() => {
                onSelectPage?.(page.pageNo);
              }}
            >
              {page.pageNo}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <strong>分页预览</strong>
        <span>{pages.length} 页</span>
      </div>
      <div className="preview-list" ref={containerRef}>
        {pages.map((page) => (
          <div key={page.pageNo} className="preview-card">
            <div className="preview-head">
              <strong>第 {page.pageNo} 页</strong>
              <button
                type="button"
                onClick={() => {
                  onDownloadPage?.(page.pageNo);
                }}
              >
                下载此页
              </button>
            </div>
            <PageCanvas page={page} scale={scale} template={template} theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
}
