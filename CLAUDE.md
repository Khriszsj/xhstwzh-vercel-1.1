# 小红书长文转图工作台 — 项目指南

## 项目概述

这是一个专为小红书内容创作者打造的在线长文转图工具，可以将富文本内容转化为精美的 1080×1440 标准小红书图片。支持富文本编辑、16+ 种皮肤模板、智能分页、自然语言排版命令、合规检测和一键导出发布包。

- **在线地址**：https://xhstwzh-shuke.vercel.app
- **创作者**：舒克（小红书 587070070）

## 技术栈

- **框架**：Next.js 15 (App Router) + React 19 + TypeScript 5.8
- **样式**：全局 CSS 变量 + CSS Grid 三栏布局
- **关键依赖**：html-to-image（DOM→PNG）、jszip（ZIP 打包）、zod（API 校验）、nanoid（唯一 ID）
- **部署**：Vercel（监听 main 分支自动部署）
- **远程仓库**：https://github.com/Khriszsj/xhstwzh-vercel-v1.4.git

## 项目结构

```
app/
  page.tsx              # 主页面，核心状态管理（文档、主题、分页、撤销/重做）
  globals.css           # 全局样式（1200+ 行），CSS 变量主题系统
  layout.tsx            # 根布局
  api/
    editor/command/     # 自然语言命令解析 API
    paginate/           # 文档分页排版 API
    compliance/check/   # 内容合规检测 API
    suggestions/        # 标题/标签智能推荐 API

components/
  RichEditor.tsx        # 富文本编辑器（contentEditable + 自定义工具栏）
  PagePreview.tsx       # 页面画布渲染与预览
  editor-serializer.ts  # HTML ↔ RichDoc 双向序列化

lib/
  types.ts              # 核心类型定义（RichDoc、PageRender、ThemeVars 等）
  defaults.ts           # 默认模板与主题配置
  presets.ts            # 图片样式与背景皮肤预设（16 种皮肤定义）
  paginate.ts           # 分页排版算法（字符测量、断行、分页）
  compliance.ts         # 风险词检测
  suggestions.ts        # 关键词提取与标题/标签生成
  command-engine.ts     # 中文自然语言命令解析引擎
  browser-export.ts     # PNG 导出与 ZIP 发布包生成
  doc.ts                # 文档工具（Markdown 转换、HTML 清理）
  id.ts / color.ts / hash.ts / http.ts / image-file.ts  # 工具函数
  risk-words.ts         # 合规风险词库
```

## 核心架构

### 数据流

1. 编辑器更新 `RichDoc` → 触发重新计算
2. 文档发送至 `/api/paginate` → 返回分页结果 + 分页警告
3. 文档发送至 `/api/compliance/check` → 返回合规问题
4. 文档发送至 `/api/suggestions` → 返回推荐标题与标签
5. 预览面板实时更新最终效果

### 文档模型（RichDoc）

```
RichDoc → DocNode[]
  ├─ ParagraphNode → InlineNode[]（文本 + 硬换行）
  │    └─ InlineNode：文本片段，含可选 marks（bold/color/fontSize/lineHeight/letterSpacing/padding）
  └─ ImageNode：嵌入图片，含尺寸、对齐、样式、标题
```

### 三栏布局

页面使用 CSS Grid 三栏布局：`160px minmax(520px, 1fr) 400px`

- **左栏**：页面缩略图 + 快捷皮肤选择器
- **中栏**：标题栏 + 文本编辑工具栏 + 参数栏 + 自然语言命令栏 + 富文本画布
- **右栏**：三标签面板（预览 / 模板 / 调整）

### 编辑器画布缩放

编辑器画布固定宽度 1080px，使用 `ResizeObserver` + CSS `zoom` 属性动态缩放以适应中间面板的可用宽度。`.panel` 需要 `min-width: 0` 和 `overflow: hidden` 防止 Grid 溢出。

## 开发命令

```bash
npm run dev -- -p 3001    # 启动开发服务器（端口 3001）
npm run build             # 生产构建
npm run lint              # ESLint 检查
```

## 编码规范

- TypeScript 严格模式，所有新代码必须有类型标注
- 组件使用函数式组件 + React Hooks
- CSS 使用全局变量（`--bg`、`--panel`、`--accent`、`--stroke` 等），不使用 CSS-in-JS
- API 路由使用 zod 校验请求体
- 文件命名：组件 PascalCase（`RichEditor.tsx`），工具函数 kebab-case（`browser-export.ts`）
- 中文注释优先，关键逻辑需要注释说明意图

## 关键注意事项

- **画布尺寸固定 1080×1440**：所有分页、渲染、导出均以此为基准，不要随意修改
- **contentEditable 编辑器**：不是基于 ProseMirror/Slate 等框架，是原生 contentEditable + 手动 DOM 操作，修改时注意浏览器兼容性
- **序列化一致性**：RichEditor 内的 DOM 变更后必须通过 `editor-serializer.ts` 同步回 RichDoc，反之亦然
- **撤销/重做**：最大 50 步历史记录，状态管理在 `page.tsx` 中
- **皮肤预设**：`presets.ts` 文件体积较大（10K+ 行），包含所有皮肤的 CSS 定义
- **分页算法**：`paginate.ts` 负责 CJK/Latin/Emoji 混排的字符宽度测量和断行，修改需谨慎测试
- **会话数据**：当前版本数据仅存在于浏览器会话中，刷新即丢失
- **Vercel 部署**：推送 main 分支即自动部署，无需手动操作

## CLAUDE.md 自维护规则

**每当完成一个功能模块的开发后，必须自动检查并更新本文件**，确保以下内容与实际代码始终保持同步：

- **目录结构**：新增、删除或移动文件/目录时，同步更新「项目结构」章节
- **接口约定**：新增或修改 API 路由、函数签名、数据类型时，同步更新「核心架构」中的相关描述
- **模块边界**：新增模块或调整模块职责时，同步更新对应文件的注释说明
- **关键注意事项**：发现新的技术约束、已知问题或重要行为时，补充到「关键注意事项」章节

> 本文件是项目的"活文档"，不允许与代码产生长期偏差。
>
> **更新时机**：无论是在支线还是直接在主线上完成开发，必须满足以下任一条件后，再执行 CLAUDE.md 的更新操作：
> 1. 功能已测试验收完成，并已提交到 Git（commit）
> 2. 功能已提交到 Git，同时也已推送到 GitHub（push）
>
> 即：开发 & 测试 → Git commit（或同时 push 到 GitHub）→ 再更新 CLAUDE.md

## Git 工作流

- **主分支**：`main`（Vercel 自动部署）
- **功能分支**：从 main 创建，完成后合并回 main
- 提交信息使用中文，格式：`类型：简短描述`（如 `修复：编辑器画布溢出右侧面板`）
