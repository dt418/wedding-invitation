/* eslint-disable @typescript-eslint/no-require-imports */
const { createCanvas } = require('canvas');
const fs2 = require('fs');
const path2 = require('path');

const OUTPUT_DIR = path2.join(__dirname, '../public/images/template-previews/listing');

function gradient(ctx, x1, y1, x2, y2, c1, c2) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

function drawOrnament(ctx, cx, cy, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRings(ctx, cx, cy, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(cx - 8, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 8, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawHeart(ctx, cx, cy, size, color) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.75);
  ctx.bezierCurveTo(cx - size, cy - size * 0.5, cx - size * 0.5, cy - size, cx, cy - size * 0.25);
  ctx.bezierCurveTo(cx + size * 0.5, cy - size, cx + size, cy - size * 0.5, cx, cy + size * 0.75);
  ctx.fill();
  ctx.globalAlpha = 1;
}

const TEMPLATES = [
  { slug: "song-long-do", accent: "#FFD700", text: "#FFFFFF", bg: "#C41E3A", bg2: "#8B1A2B", label: "Song Long Đỏ" },
  { slug: "long-phung-do", accent: "#FFD700", text: "#FFFFFF", bg: "#8B0000", bg2: "#4A0000", label: "Long Phụng Đỏ" },
  { slug: "song-phung-do", accent: "#FFD700", text: "#FFFFFF", bg: "#DC143C", bg2: "#8B0A1A", label: "Song Phụng Đỏ" },
  { slug: "nhat-binh-do", accent: "#8B4513", text: "#2F1810", bg: "#D4A574", bg2: "#BF9060", label: "Nhật Bình Đỏ" },
  { slug: "minimalism-do", accent: "#C41E3A", text: "#1A1A1A", bg: "#F5F5F5", bg2: "#FFFFFF", label: "Minimalism Đỏ" },
  { slug: "long-phung-v2-do", accent: "#FFD700", text: "#FFFFFF", bg: "#8B0000", bg2: "#5C0000", label: "Long Phụng V2 Đỏ" },
  { slug: "hoang-kim-do", accent: "#E1BC7C", text: "#FFFFFF", bg: "#3E0001", bg2: "#1C0000", label: "Hoàng Kim Đỏ" },
  { slug: "chibi-red", accent: "#FF69B4", text: "#FFFFFF", bg: "#C41E3A", bg2: "#8B1436", label: "Chibi Đỏ" },
  { slug: "vuon-xuan-do", accent: "#C41E3A", text: "#FFFFFF", bg: "#1B5E20", bg2: "#0A2A0E", label: "Vườn Xuân Đỏ" },
  { slug: "co-ba-do", accent: "#8B0000", text: "#2F1810", bg: "#D4A574", bg2: "#C4935E", label: "Cô Ba Đỏ" },
  { slug: "long-phung-huyen", accent: "#E1BC7C", text: "#FFFFFF", bg: "#1A1A1A", bg2: "#000000", label: "Long Phụng Huyền" },
  { slug: "anh-dao-hong", accent: "#FF69B4", text: "#4A1A2C", bg: "#FFB6C1", bg2: "#FF8EA6", label: "Anh Đào Hồng" },
  { slug: "hoa-moc-hong", accent: "#F5DEB3", text: "#FFFFFF", bg: "#9D6D63", bg2: "#7A5248", label: "Hoa Mộc Hồng" },
  { slug: "hoa-moc-xanh", accent: "#8FBC8F", text: "#FFFFFF", bg: "#4A7C59", bg2: "#2D5C3C", label: "Hoa Mộc Xanh" },
  { slug: "thanh-diep-xanh", accent: "#90EE90", text: "#FFFFFF", bg: "#2E8B57", bg2: "#1A5C37", label: "Thanh Diệp Xanh" },
  { slug: "song-long-xanh", accent: "#8FBC8F", text: "#FFFFFF", bg: "#2E5A4C", bg2: "#14382C", label: "Song Long Xanh" },
  { slug: "vuon-xuan-xanh", accent: "#90EE90", text: "#FFFFFF", bg: "#1B5E20", bg2: "#0A3A0E", label: "Vườn Xuân Xanh" },
  { slug: "song-phung-xanh", accent: "#FFD700", text: "#FFFFFF", bg: "#2E8B57", bg2: "#1A5C37", label: "Song Phụng Xanh" },
  { slug: "long-phung-xanh", accent: "#E1BC7C", text: "#FFFFFF", bg: "#2E5A4C", bg2: "#14382C", label: "Long Phụng Xanh" },
  { slug: "vuon-xuan-lam", accent: "#87CEEB", text: "#FFFFFF", bg: "#4682B4", bg2: "#2A5A7C", label: "Vườn Xuân Lam" },
  { slug: "long-phung-lam", accent: "#E1BC7C", text: "#FFFFFF", bg: "#191970", bg2: "#0C0C3A", label: "Long Phụng Lam" },
  { slug: "song-long-lam", accent: "#87CEEB", text: "#FFFFFF", bg: "#4169E1", bg2: "#1A3A8A", label: "Song Long Lam" },
  { slug: "hoang-kim-lam", accent: "#E1BC7C", text: "#FFFFFF", bg: "#00112E", bg2: "#000815", label: "Hoàng Kim Lam" },
  { slug: "hoang-kim-xanh", accent: "#E1BC7C", text: "#FFFFFF", bg: "#001A08", bg2: "#000A03", label: "Hoàng Kim Xanh" },
  { slug: "mai-lan-trang", accent: "#404A1D", text: "#1A1A1A", bg: "#FFFAF7", bg2: "#F0E8E0", label: "Mai Lan Trắng" },
  { slug: "hoa-moc-nau", accent: "#D2B48C", text: "#FFFFFF", bg: "#8B7355", bg2: "#5C4A30", label: "Hoa Mộc Nâu" },
  { slug: "hoa-lua-nau", accent: "#DEB887", text: "#FFFFFF", bg: "#A0522D", bg2: "#6B3018", label: "Hoa Lụa Nâu" },
];

const W = 400, H = 711;

function createTemplatePreview(tpl) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const { bg, bg2, accent, text, label } = tpl;

  // Background
  ctx.fillStyle = gradient(ctx, 0, 0, W, H, bg, bg2);
  ctx.fillRect(0, 0, W, H);

  // Pattern overlay
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.03;
  for (let x = 0; x < W; x += 8) {
    for (let y = 0; y < H; y += 8) {
      if ((x + y) % 16 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  ctx.globalAlpha = 1;

  // Border frame
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.globalAlpha = 0.15;
  ctx.strokeRect(26, 26, W - 52, H - 52);
  ctx.globalAlpha = 1;

  // Top ornament
  drawOrnament(ctx, W/2, 100, 35, accent);

  // Heart decoration
  drawHeart(ctx, W/2, 250, 35, accent);

  // Wedding rings
  drawRings(ctx, W/2, 350, 25, accent);

  // Template name
  const fs = label.length > 18 ? 22 : 28;
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.95;
  ctx.font = `bold ${fs}px "system-ui", -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(label, W/2, 460);

  // Subtitle
  ctx.globalAlpha = 0.6;
  ctx.font = '14px "system-ui", -apple-system, sans-serif';
  ctx.fillText("Thiệp Cưới Online", W/2, 490);

  // Bottom accent line
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(W/2 - 80, 540);
  ctx.lineTo(W/2 + 80, 540);
  ctx.stroke();

  // Footer
  ctx.globalAlpha = 0.3;
  ctx.font = '11px "system-ui", -apple-system, sans-serif';
  ctx.fillText("chungdoi.com · wedding invitation", W/2, 640);
  ctx.globalAlpha = 1;

  const buf = canvas.toBuffer('image/png');
  fs2.writeFileSync(path2.join(OUTPUT_DIR, `${tpl.slug}.png`), buf);
  console.log(`Created: ${tpl.slug}.png`);
}

if (!fs2.existsSync(OUTPUT_DIR)) {
  fs2.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("Generating themed PNG placeholders...\n");
TEMPLATES.forEach(tpl => createTemplatePreview(tpl));
console.log("\nDone!");
