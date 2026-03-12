import type { ThemeVars } from "./types";

export type ImageStylePreset = "clean" | "soft-shadow" | "polaroid" | "glass";

export interface ImageStyleDefinition {
  id: ImageStylePreset;
  name: string;
  description: string;
  frameStyle: {
    background: string;
    border: string;
    borderRadius: number;
    padding: number;
    boxShadow: string;
  };
  imageStyle: {
    borderRadius: number;
  };
}

export const IMAGE_STYLE_PRESETS: ImageStyleDefinition[] = [
  {
    id: "clean",
    name: "纯净图",
    description: "无装饰，突出内容",
    frameStyle: {
      background: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none"
    },
    imageStyle: {
      borderRadius: 10
    }
  },
  {
    id: "soft-shadow",
    name: "柔和阴影",
    description: "适合干货封面",
    frameStyle: {
      background: "#ffffff",
      border: "1px solid rgba(15, 23, 42, 0.08)",
      borderRadius: 18,
      padding: 10,
      boxShadow: "0 16px 26px rgba(15, 23, 42, 0.16)"
    },
    imageStyle: {
      borderRadius: 14
    }
  },
  {
    id: "polaroid",
    name: "拍立得",
    description: "有边框的纪实感",
    frameStyle: {
      background: "#ffffff",
      border: "1px solid rgba(15, 23, 42, 0.1)",
      borderRadius: 8,
      padding: 14,
      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.14)"
    },
    imageStyle: {
      borderRadius: 2
    }
  },
  {
    id: "glass",
    name: "玻璃卡",
    description: "轻透明卡片风",
    frameStyle: {
      background: "rgba(255, 255, 255, 0.72)",
      border: "1px solid rgba(255, 255, 255, 0.8)",
      borderRadius: 24,
      padding: 12,
      boxShadow: "0 18px 28px rgba(15, 23, 42, 0.12)"
    },
    imageStyle: {
      borderRadius: 16
    }
  }
];

export function resolveImageStylePreset(preset?: string): ImageStyleDefinition {
  return (
    IMAGE_STYLE_PRESETS.find((item) => item.id === preset) ??
    IMAGE_STYLE_PRESETS[1]
  );
}

export interface BackgroundPreset {
  id: string;
  category?: "simple" | "ins";
  name: string;
  description: string;
  preview: string;
  patch: Partial<ThemeVars>;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "simple-grid-green",
    category: "simple",
    name: "简单格子",
    description: "浅绿网格，适合干货长文",
    preview:
      "repeating-linear-gradient(0deg, rgba(59,130,96,0.14) 0 1px, transparent 1px 26px),repeating-linear-gradient(90deg, rgba(59,130,96,0.14) 0 1px, transparent 1px 26px),#eef8ef",
    patch: {
      pageBackground:
        "repeating-linear-gradient(0deg, rgba(59,130,96,0.14) 0 1px, transparent 1px 26px),repeating-linear-gradient(90deg, rgba(59,130,96,0.14) 0 1px, transparent 1px 26px),#eef8ef",
      textColor: "#153a2a",
      primaryColor: "#1f7a4f",
      secondaryColor: "#4f7764",
      accentColor: "#22a55a"
    }
  },
  {
    id: "kraft-paper",
    category: "simple",
    name: "牛皮纸",
    description: "复古纸张质感，适合故事叙述",
    preview:
      "radial-gradient(circle at 16% 24%, rgba(255,255,255,0.18) 0 1.2px, transparent 1.2px),radial-gradient(circle at 78% 66%, rgba(77,45,10,0.08) 0 1.1px, transparent 1.1px),linear-gradient(180deg, #ddc89f 0%, #d1b37e 100%)",
    patch: {
      pageBackground:
        "radial-gradient(circle at 16% 24%, rgba(255,255,255,0.18) 0 1.2px, transparent 1.2px),radial-gradient(circle at 78% 66%, rgba(77,45,10,0.08) 0 1.1px, transparent 1.1px),linear-gradient(180deg, #ddc89f 0%, #d1b37e 100%)",
      textColor: "#3c2b13",
      primaryColor: "#6b4a1f",
      secondaryColor: "#8c6f42",
      accentColor: "#b86b32"
    }
  },
  {
    id: "apple-notes",
    category: "simple",
    name: "苹果备忘录",
    description: "米白横线纸，清爽记事感",
    preview:
      "repeating-linear-gradient(0deg, rgba(229,211,162,0.42) 0 1px, transparent 1px 42px),linear-gradient(90deg, transparent 0 70px, rgba(235,112,112,0.34) 70px 72px, transparent 72px 100%),#fffdf3",
    patch: {
      pageBackground:
        "repeating-linear-gradient(0deg, rgba(229,211,162,0.42) 0 1px, transparent 1px 42px),linear-gradient(90deg, transparent 0 70px, rgba(235,112,112,0.34) 70px 72px, transparent 72px 100%),#fffdf3",
      textColor: "#253142",
      primaryColor: "#1f7a4f",
      secondaryColor: "#6b7280",
      accentColor: "#ec6d3f"
    }
  },
  {
    id: "minimal-grid-blue",
    category: "simple",
    name: "蓝白方格",
    description: "理性清晰，适合方法论内容",
    preview:
      "repeating-linear-gradient(0deg, rgba(96,165,250,0.14) 0 1px, transparent 1px 26px),repeating-linear-gradient(90deg, rgba(96,165,250,0.14) 0 1px, transparent 1px 26px),#f7fbff",
    patch: {
      pageBackground:
        "repeating-linear-gradient(0deg, rgba(96,165,250,0.14) 0 1px, transparent 1px 26px),repeating-linear-gradient(90deg, rgba(96,165,250,0.14) 0 1px, transparent 1px 26px),#f7fbff",
      textColor: "#13344b",
      primaryColor: "#245c8f",
      secondaryColor: "#577c9e",
      accentColor: "#3c82d4"
    }
  },
  {
    id: "warm-cream",
    category: "simple",
    name: "暖米色",
    description: "通用小红书干货风",
    preview: "linear-gradient(135deg, #fffaf4 0%, #fef3dd 100%)",
    patch: {
      pageBackground: "#fffaf4",
      textColor: "#111827",
      primaryColor: "#1f2937",
      secondaryColor: "#6b7280",
      accentColor: "#ef4444"
    }
  },
  {
    id: "minimal-white",
    category: "simple",
    name: "极简白",
    description: "信息密度高的阅读风",
    preview: "linear-gradient(135deg, #ffffff 0%, #f4f5f7 100%)",
    patch: {
      pageBackground: "#ffffff",
      textColor: "#0f172a",
      primaryColor: "#0f172a",
      secondaryColor: "#64748b",
      accentColor: "#e11d48"
    }
  },
  {
    id: "forest-note",
    category: "simple",
    name: "森系笔记",
    description: "偏生活感与治愈",
    preview: "linear-gradient(135deg, #f3fbf5 0%, #e6f5e8 100%)",
    patch: {
      pageBackground: "#f3fbf5",
      textColor: "#12372a",
      primaryColor: "#12372a",
      secondaryColor: "#3a6351",
      accentColor: "#2d9b6f"
    }
  },
  {
    id: "rose-card",
    category: "simple",
    name: "玫瑰卡片",
    description: "适合故事类表达",
    preview: "linear-gradient(135deg, #fff6f7 0%, #ffe9ed 100%)",
    patch: {
      pageBackground: "#fff6f7",
      textColor: "#3f2430",
      primaryColor: "#3f2430",
      secondaryColor: "#8a5d6f",
      accentColor: "#ef476f"
    }
  },
  {
    id: "night-ink",
    category: "simple",
    name: "夜墨蓝",
    description: "深底高对比",
    preview: "linear-gradient(135deg, #10223a 0%, #1a2f4c 100%)",
    patch: {
      pageBackground: "#10223a",
      textColor: "#e2ebff",
      primaryColor: "#e2ebff",
      secondaryColor: "#a4b7db",
      accentColor: "#79c7ff"
    }
  },

  {
    id: "glassmorphism-pink",
    category: "ins",
    name: "毛玻璃亚克力",
    description: "流体渐变背景叠加磨砂透视感",
    preview: "linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fff1eb 100%)",
    patch: {
      pageBackground: "linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fff1eb 100%)",
      textColor: "#333333",
      primaryColor: "#555555",
      secondaryColor: "#888888",
      accentColor: "#f48fb1",
      skinStyle: "glassmorphism"
    }
  },
  {
    id: "scrapbook-polaroid",
    category: "ins",
    name: "复古手帐风",
    description: "拍立得相纸与打字机质感",
    preview: "radial-gradient(circle at center, #f4ecd8 0%, #e6d8c0 100%)",
    patch: {
      pageBackground: "radial-gradient(circle at center, #f4ecd8 0%, #e6d8c0 100%)",
      textColor: "#4a4238",
      primaryColor: "#4a4238",
      secondaryColor: "#8b8173",
      accentColor: "#d37c68",
      skinStyle: "scrapbook"
    }
  },
  {
    id: "magazine-minimal",
    category: "ins",
    name: "高级杂志风",
    description: "大面积留白与细线排版，奢华极简",
    preview: "#f4f4f0",
    patch: {
      pageBackground: "#f4f4f0",
      textColor: "#1a1a1a",
      primaryColor: "#1a1a1a",
      secondaryColor: "#666666",
      accentColor: "#333333",
      skinStyle: "magazine"
    }
  },
  {
    id: "ambient-gradient-sunset",
    category: "ins",
    name: "落日情绪渐变",
    description: "莫兰迪落日渐变，浓郁情感氛围",
    preview: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    patch: {
      pageBackground: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
      textColor: "#1c2b4d",
      primaryColor: "#1c2b4d",
      secondaryColor: "#5a6b8c",
      accentColor: "#8b5fad",
      skinStyle: "gradient"
    }
  },

  {
    id: "card-violet-glow",
    category: "ins",
    name: "紫粉炫光卡",
    description: "紫红渐变外框，独立白底卡片",
    preview: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    patch: {
      pageBackground: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      textColor: "#1f1f1f",
      primaryColor: "#333333",
      secondaryColor: "#777777",
      accentColor: "#9c27b0",
      skinStyle: "highlight-card"
    }
  },
  {
    id: "card-blue-glow",
    category: "ins",
    name: "冰蓝炫光卡",
    description: "青蓝渐变外框，独立白底卡片",
    preview: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    patch: {
      pageBackground: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      textColor: "#1f1f1f",
      primaryColor: "#333333",
      secondaryColor: "#777777",
      accentColor: "#0288d1",
      skinStyle: "highlight-card"
    }
  },
  {
    id: "card-candy-yellow",
    category: "ins",
    name: "糖果暖黄卡",
    description: "暖黄渐变边框，带波浪/涂鸦感贴纸设计",
    preview: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    patch: {
      pageBackground: "#ffe898",
      textColor: "#3e3222",
      primaryColor: "#5c4f3a",
      secondaryColor: "#8f7c5f",
      accentColor: "#ff9800",
      skinStyle: "candy-card-yellow"
    }
  },
  {
    id: "card-candy-blue",
    category: "ins",
    name: "糖果浅蓝卡",
    description: "浅蓝边框，带手绘风贴纸设计",
    preview: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    patch: {
      pageBackground: "#b2dffb",
      textColor: "#2a3b4c",
      primaryColor: "#3a4c5e",
      secondaryColor: "#6c8c9f",
      accentColor: "#03a9f4",
      skinStyle: "candy-card-blue"
    }
  }
];
