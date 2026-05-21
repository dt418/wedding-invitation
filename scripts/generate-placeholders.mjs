import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../public/images/template-previews/listing");

// Color mappings based on template names
const COLOR_MAP = {
  "song-long-do": { bg: "#C41E3A", accent: "#FFD700", text: "#FFFFFF" },
  "long-phung-do": { bg: "#8B0000", accent: "#FFD700", text: "#FFFFFF" },
  "song-phung-do": { bg: "#DC143C", accent: "#FFD700", text: "#FFFFFF" },
  "nhat-binh-do": { bg: "#D4A574", accent: "#8B4513", text: "#2F1810" },
  "minimalism-do": { bg: "#FAFAFA", accent: "#C41E3A", text: "#1A1A1A" },
  "long-phung-v2-do": { bg: "#8B0000", accent: "#FFD700", text: "#FFFFFF" },
  "hoang-kim-do": { bg: "#3E0001", accent: "#E1BC7C", text: "#FFFFFF" },
  "chibi-red": { bg: "#C41E3A", accent: "#FFD700", text: "#FFFFFF" },
  "vuon-xuan-do": { bg: "#228B22", accent: "#C41E3A", text: "#FFFFFF" },
  "co-ba-do": { bg: "#D4A574", accent: "#8B0000", text: "#2F1810" },
  "long-phung-huyen": { bg: "#1A1A1A", accent: "#E1BC7C", text: "#FFFFFF" },
  "anh-dao-hong": { bg: "#FFB6C1", accent: "#FF69B4", text: "#4A1A2C" },
  "hoa-moc-hong": { bg: "#9D6D63", accent: "#F5DEB3", text: "#FFFFFF" },
  "hoa-moc-xanh": { bg: "#4A7C59", accent: "#8FBC8F", text: "#FFFFFF" },
  "thanh-diep-xanh": { bg: "#2E8B57", accent: "#90EE90", text: "#FFFFFF" },
  "song-long-xanh": { bg: "#2E5A4C", accent: "#8FBC8F", text: "#FFFFFF" },
  "vuon-xuan-xanh": { bg: "#228B22", accent: "#90EE90", text: "#FFFFFF" },
  "song-phung-xanh": { bg: "#2E8B57", accent: "#FFD700", text: "#FFFFFF" },
  "long-phung-xanh": { bg: "#2E5A4C", accent: "#E1BC7C", text: "#FFFFFF" },
  "vuon-xuan-lam": { bg: "#4682B4", accent: "#87CEEB", text: "#FFFFFF" },
  "long-phung-lam": { bg: "#191970", accent: "#E1BC7C", text: "#FFFFFF" },
  "song-long-lam": { bg: "#4169E1", accent: "#87CEEB", text: "#FFFFFF" },
  "hoang-kim-lam": { bg: "#00112E", accent: "#E1BC7C", text: "#FFFFFF" },
  "mai-lan-trang": { bg: "#FFFAF7", accent: "#404A1D", text: "#1A1A1A" },
  "hoa-moc-nau": { bg: "#8B7355", accent: "#D2B48C", text: "#FFFFFF" },
  "hoa-lua-nau": { bg: "#A0522D", accent: "#DEB887", text: "#FFFFFF" },
  "hoang-kim-xanh": { bg: "#001A08", accent: "#E1BC7C", text: "#FFFFFF" },
};

const DEFAULT_COLORS = { bg: "#C41E3A", accent: "#FFD700", text: "#FFFFFF" };

function getColors(slug) {
  return COLOR_MAP[slug] || DEFAULT_COLORS;
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return "#" + ((r << 16 | g << 8 | b).toString(16).padStart(6, "0"));
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateSVG(slug, colors) {
  const { bg, accent, text } = colors;
  const name = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const bgDark = adjustColor(bg, -30);
  const textOnBg = (text === "#FFFFFF" || text === "#FAFAFA" || text === "#FFFAF7") ? text : "#FFFFFF";
  
  const svg = `<svg width="400" height="711" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bgDark}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="711" fill="url(#bg)"/>
  <rect x="16" y="16" width="368" height="679" rx="12" fill="none" stroke="${textOnBg}" stroke-width="2" opacity="0.3"/>
  <rect x="24" y="24" width="352" height="663" rx="8" fill="none" stroke="${textOnBg}" stroke-width="1" opacity="0.2"/>
  <circle cx="200" cy="100" r="40" fill="${textOnBg}" opacity="0.1"/>
  <circle cx="200" cy="100" r="30" fill="${accent}" opacity="0.3"/>
  <circle cx="200" cy="100" r="18" fill="${accent}" opacity="0.5"/>
  <text x="200" y="200" text-anchor="middle" font-family="system-ui" font-size="24" font-weight="600" fill="${textOnBg}" opacity="0.9">${escapeXml(name)}</text>
  <line x1="100" y1="240" x2="300" y2="240" stroke="${accent}" stroke-width="1" opacity="0.5"/>
  <circle cx="200" cy="240" r="4" fill="${accent}"/>
  <circle cx="200" cy="400" r="35" fill="none" stroke="${accent}" stroke-width="3" opacity="0.7"/>
  <circle cx="200" cy="400" r="25" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>
  <text x="200" y="520" text-anchor="middle" font-family="system-ui" font-size="14" fill="${textOnBg}" opacity="0.6">Wedding Invitation</text>
  <text x="200" y="600" text-anchor="middle" font-family="system-ui" font-size="10" fill="${textOnBg}" opacity="0.4">chungdoi.com</text>
</svg>`;
  return svg;
}

const TEMPLATES = [
  "song-long-do", "hoa-moc-xanh", "long-phung-do", "song-phung-do",
  "mai-lan-trang", "nhat-binh-do", "thanh-diep-xanh", "minimalism-do",
  "long-phung-v2-do", "song-long-xanh", "vuon-xuan-xanh", "hoang-kim-do",
  "hoa-moc-hong", "chibi-red", "song-phung-xanh", "anh-dao-hong",
  "long-phung-xanh", "vuon-xuan-do", "hoa-moc-nau", "hoa-lua-nau",
  "vuon-xuan-lam", "long-phung-lam", "song-long-lam", "co-ba-do",
  "long-phung-huyen", "hoang-kim-lam", "hoang-kim-xanh"
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("Generating SVG placeholders...\n");

TEMPLATES.forEach(slug => {
  const colors = getColors(slug);
  const svg = generateSVG(slug, colors);
  const outputPath = path.join(OUTPUT_DIR, slug + ".svg");
  fs.writeFileSync(outputPath, svg, "utf8");
  console.log("Created: " + slug + ".svg");
});

// Clean up old webp files
const webpFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith(".webp"));
webpFiles.forEach(f => {
  fs.unlinkSync(path.join(OUTPUT_DIR, f));
  console.log("Removed: " + f);
});

console.log("\nDone!");
