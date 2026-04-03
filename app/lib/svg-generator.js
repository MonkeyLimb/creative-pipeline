// SVG ad creative generator
// Generates styled ad layouts with copy text — no external APIs needed

const PLATFORM_DIMS = {
  instagram: { w: 1080, h: 1080 },
  facebook: { w: 940, h: 788 },
  tiktok: { w: 1080, h: 1920 },
};

// Color palettes per tone
const PALETTES = {
  default: { bg: "#0f172a", accent: "#f97316", text: "#ffffff", sub: "#cbd5e1", footer: "#64748b" },
  warm: { bg: "#1c1917", accent: "#f59e0b", text: "#ffffff", sub: "#d6d3d1", footer: "#78716c" },
  cool: { bg: "#0c1222", accent: "#3b82f6", text: "#ffffff", sub: "#94a3b8", footer: "#64748b" },
  bold: { bg: "#18181b", accent: "#ef4444", text: "#ffffff", sub: "#d4d4d8", footer: "#71717a" },
};

function escapeXml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Word-wrap text into lines that fit a given width (approximate)
function wrapText(text, maxCharsPerLine) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export function generateAdSVG({ hook, subtext, cta, disclaimer, platform, program, creative_type }) {
  const dims = PLATFORM_DIMS[platform?.toLowerCase()] || PLATFORM_DIMS.instagram;
  const { w, h } = dims;

  // Pick palette based on creative type
  const palette = creative_type === "Organic" ? PALETTES.cool : PALETTES.default;
  const isVertical = h > w; // TikTok

  // Font sizes scale with dimensions
  const scale = w / 1080;
  const hookSize = Math.round(52 * scale);
  const subSize = Math.round(24 * scale);
  const ctaSize = Math.round(22 * scale);
  const disclaimerSize = Math.round(14 * scale);
  const brandSize = Math.round(13 * scale);

  const pad = Math.round(60 * scale);
  const maxChars = Math.round(28 / scale);

  // Wrap text
  const hookLines = wrapText(hook, maxChars);
  const subLines = wrapText(subtext, Math.round(maxChars * 1.4));

  // Layout positions
  const brandY = pad;
  const hookStartY = isVertical ? Math.round(h * 0.25) : Math.round(h * 0.22);
  const hookLineHeight = hookSize * 1.25;
  const subStartY = hookStartY + hookLines.length * hookLineHeight + Math.round(30 * scale);
  const subLineHeight = subSize * 1.5;
  const ctaY = Math.min(subStartY + subLines.length * subLineHeight + Math.round(50 * scale), h - Math.round(140 * scale));
  const disclaimerY = h - Math.round(50 * scale);

  // CTA button dimensions
  const ctaW = Math.round(Math.max(260, cta?.length * 16) * scale);
  const ctaH = Math.round(52 * scale);
  const ctaX = pad;
  const ctaBtnY = ctaY - Math.round(8 * scale);

  // Decorative accent bar
  const accentBarW = Math.round(60 * scale);
  const accentBarH = Math.round(5 * scale);
  const accentBarY = hookStartY - Math.round(24 * scale);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg}"/>
      <stop offset="100%" stop-color="${adjustColor(palette.bg, 20)}"/>
    </linearGradient>
    <linearGradient id="cta-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${palette.accent}"/>
      <stop offset="100%" stop-color="${adjustColor(palette.accent, -20)}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#bg)"/>

  <!-- Subtle pattern overlay -->
  <rect width="${w}" height="${h}" fill="none" stroke="${palette.accent}" stroke-opacity="0.03" stroke-width="1">
    <animate attributeName="stroke-opacity" values="0.03;0.06;0.03" dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Brand -->
  <text x="${pad}" y="${brandY + brandSize}" font-family="system-ui, -apple-system, sans-serif" font-size="${brandSize}" font-weight="700" fill="${palette.accent}" letter-spacing="3" text-transform="uppercase">DREAMBOUND</text>

  <!-- Accent bar -->
  <rect x="${pad}" y="${accentBarY}" width="${accentBarW}" height="${accentBarH}" rx="${accentBarH / 2}" fill="${palette.accent}"/>

  <!-- Hook text -->
  ${hookLines
    .map(
      (line, i) =>
        `<text x="${pad}" y="${hookStartY + i * hookLineHeight}" font-family="system-ui, -apple-system, sans-serif" font-size="${hookSize}" font-weight="800" fill="${palette.text}" letter-spacing="-0.5">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Subtext -->
  ${subLines
    .map(
      (line, i) =>
        `<text x="${pad}" y="${subStartY + i * subLineHeight}" font-family="system-ui, -apple-system, sans-serif" font-size="${subSize}" font-weight="400" fill="${palette.sub}" letter-spacing="0.2">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- CTA button -->
  ${cta ? `
  <rect x="${ctaX}" y="${ctaBtnY}" width="${ctaW}" height="${ctaH}" rx="${Math.round(ctaH / 2)}" fill="url(#cta-grad)"/>
  <text x="${ctaX + ctaW / 2}" y="${ctaBtnY + ctaH / 2 + ctaSize * 0.35}" font-family="system-ui, -apple-system, sans-serif" font-size="${ctaSize}" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${escapeXml(cta)}</text>
  ` : ""}

  <!-- Disclaimer -->
  ${disclaimer ? `
  <text x="${pad}" y="${disclaimerY}" font-family="system-ui, -apple-system, sans-serif" font-size="${disclaimerSize}" font-weight="400" fill="${palette.footer}">${escapeXml(disclaimer)}</text>
  ` : ""}

  <!-- Bottom accent line -->
  <rect x="0" y="${h - 4}" width="${w}" height="4" fill="${palette.accent}" opacity="0.6"/>
</svg>`;

  return { svg, width: w, height: h };
}

// Slightly adjust hex color brightness
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
