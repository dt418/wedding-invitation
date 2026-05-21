const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/images/template-previews/listing');

// Motif functions for different template categories
function drawDragonPhoenix(ctx, x, y, color, color2) {
  // Stylized dragon/phoenix motif
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Dragon body curves
  ctx.moveTo(x-40, y+30);
  ctx.quadraticCurveTo(x-20, y-20, x, y);
  ctx.quadraticCurveTo(x+20, y+20, x+40, y-10);
  ctx.moveTo(x-45, y+30);
  ctx.quadraticCurveTo(x-25, y-15, x-5, y+5);
  ctx.stroke();

  // Phoenix counterpart
  ctx.strokeStyle = color2;
  ctx.beginPath();
  ctx.moveTo(x+40, y+30);
  ctx.quadraticCurveTo(x+20, y-20, x, y);
  ctx.quadraticCurveTo(x-20, y+20, x-40, y-10);
  ctx.moveTo(x+45, y+30);
  ctx.quadraticCurveTo(x+25, y-15, x+5, y+5);
  ctx.stroke();
}

function drawFloralPattern(ctx, x, y, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const px = x + Math.cos(angle) * 25;
    const py = y + Math.sin(angle) * 25;
    ctx.beginPath();
    ctx.ellipse(px, py, 10, 6, angle, 0, Math.PI * 2);
    ctx.globalAlpha = 0.4 + (i * 0.1);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawGeometricPattern(ctx, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < w; i += 40) {
    for (let j = 0; j < h; j += 40) {
      ctx.strokeRect(i, j, 35, 35);
    }
  }
  ctx.globalAlpha = 1;
}

function drawCherryBlossom(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(angle)*12, y + Math.sin(angle)*12, 6, 3, angle, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI*2);
  ctx.fillStyle = '#FFF';
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRoyalFrame(ctx, x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);

  // Corner ornaments
  const ornSize = 20;
  [
    [x, y], [x+w, y], [x, y+h], [x+w, y+h]
  ].forEach(([cx, cy]) => {
    const dx = cx === x ? 1 : -1;
    const dy = cy === y ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy*ornSize);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx*ornSize, cy);
    ctx.stroke();
  });
}

function drawLeafPattern(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const lx = x + Math.cos(angle) * 30;
    const ly = y + Math.sin(angle) * 30;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 8, 4, angle + 0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawTraditionalBorder(ctx, w, h, color) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  const margin = 15;
  // Outer border
  ctx.strokeRect(margin, margin, w - margin*2, h - margin*2);
  // Inner border
  ctx.strokeRect(margin+5, margin+5, w - (margin+5)*2, h - (margin+5)*2);
  // Corner decorations
  [
    [margin+5, margin+5],
    [w-margin-5, margin+5],
    [margin+5, h-margin-5],
    [w-margin-5, h-margin-5]
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI*2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawMinimalistLine(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

const TEMPLATES = [
  // Template, accentColor, textColor, bgColor, category, decorative
  { slug: "song-long-do", accent: "#FFD700", text: "#FFFFFF", bg: "#C41E3A", cat: "dragon", label: "Song Long Đỏ" },
  { slug: "long-phung-do", accent: "#FFD700", text: "#FFFFFF", bg: "#8B0000", cat: "dragon", label: "Long Phụng Đỏ" },
  { slug: "song-phung-do", accent: "#FFD700", text: "#FFFFFF", bg: "#DC143C", cat: "phoenix", label: "Song Phụng Đỏ" },
  { slug: "nhat-binh-do", accent: "#8B4513", text: "#2F1810", bg: "#D4A574", cat: "vintage", label: "Nhật Bình Đỏ" },
  { slug: "minimalism-do", accent: "#C41E3A", text: "#1A1A1A", bg: "#FAFAFA", cat: "minimal", label: "Minimalism Đỏ" },
  { slug: "long-phung-v2-do", accent: "#FFD700", text: "#FFFFFF", bg: "#8B0000", cat: "dragon", label: "Long Phụng V2 Đỏ" },
  { slug: "hoang-kim-do", accent: "#E1BC7C", text: "#FFFFFF", bg: "#3E0001", cat: "royal", label: "Hoàng Kim Đỏ" },
  { slug: "chibi-red", accent: "#FFD700", text: "#FFFFFF", bg: "#C41E3A", cat: "cute", label: "Chibi Đỏ" },
  { slug: "vuon-xuan-do", accent: "#C41E3A", text: "#FFFFFF", bg: "#1B5E20", cat: "garden", label: "Vườn Xuân Đỏ" },
  { slug: "co-ba-do", accent: "#8B0000", text: "#2F1810", bg: "#D4A574", cat: "vintage", label: "Cô Ba Đỏ" },
  { slug: "long-phung-huyen", accent: "#E1BC7C", text: "#FFFFFF", bg: "#1A1A1A", cat: "dragon", label: "Long Phụng Huyền" },
  { slug: "anh-dao-hong", accent: "#FF69B4", text: "#4A1A2C", bg: "#FFB6C1", cat: "cherry", label: "Anh Đào Hồng" },
  { slug: "hoa-moc-hong", accent: "#F5DEB3", text: "#FFFFFF", bg: "#9D6D63", cat: "floral", label: "Hoa Mộc Hồng" },
  { slug: "hoa-moc-xanh", accent: "#8FBC8F", text: "#FFFFFF", bg: "#4A7C59", cat: "floral", label: "Hoa Mộc Xanh" },
  { slug: "thanh-diep-xanh", accent: "#90EE90", text: "#FFFFFF", bg: "#2E8B57", cat: "leaf", label: "Thanh Diệp Xanh" },
  { slug: "song-long-xanh", accent: "#8FBC8F", text: "#FFFFFF", bg: "#2E5A4C", cat: "dragon", label: "Song Long Xanh" },
  { slug: "vuon-xuan-xanh", accent: "#90EE90", text: "#FFFFFF", bg: "#1B5E20", cat: "garden", label: "Vườn Xuân Xanh" },
  { slug: "song-phung-xanh", accent: "#FFD700", text: "#FFFFFF", bg: "#2E8B57", cat: "phoenix", label: "Song Phụng Xanh" },
  { slug: "long-phung-xanh", accent: "#E1BC7C", text: "#FFFFFF", bg: "#2E5A4C", cat: "dragon", label: "Long Phụng Xanh" },
  { slug: "vuon-xuan-lam", accent: "#87CEEB", text: "#FFFFFF", bg: "#4682B4", cat: "garden", label: "Vườn Xuân Lam" },
  { slug: "long-phung-lam", accent: "#E1BC7C", text: "#FFFFFF", bg: "#191970", cat: "dragon", label: "Long Phụng Lam" },
  { slug: "song-long-lam", accent: "#87CEEB", text: "#FFFFFF", bg: "#4169E1", cat: "dragon", label: "Song Long Lam" },
  { slug: "hoang-kim-lam", accent: "#E1BC7C", text: "#FFFFFF", bg: "#00112E", cat: "royal", label: "Hoàng Kim Lam" },
  { slug: "hoang-kim-xanh", accent: "#E1BC7C", text: "#FFFFFF", bg: "#001A08", cat: "royal", label: "Hoàng Kim Xanh" },
  { slug: "mai-lan-trang", accent: "#404A1D", text: "#1A1A1A", bg: "#FFFAF7", cat: "minimal", label: "Mai Lan Trắng" },
  { slug: "hoa-moc-nau", accent: "#D2B48C", text: "#FFFFFF", bg: "#8B7355", cat: "floral", label: "Hoa Mộc Nâu" },
  { slug: "hoa-lua-nau", accent: "#DEB887", text: "#FFFFFF", bg: "#A0522D", cat: "minimal", label: "Hoa Lụa Nâu" },
];

function createTemplatePreview(tpl) {
  const w = 400, h = 711;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  const { bg, accent, text, cat, label } = tpl;

  // ─ Background ─
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, bg);
  gradient.addColorStop(0.5, bg);
  gradient.addColorStop(1, adjustColor(bg, -40));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // ─ Subtle dot pattern ─
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.04;
  for (let x = 0; x < w; x += 20) {
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.arc(x + 10, y + 10, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // ─ Border ─
  drawTraditionalBorder(ctx, w, h, accent);

  // ─ Category-specific motif ─
  const centerY = 280;

  switch(cat) {
    case "dragon":
      drawDragonPhoenix(ctx, w/2, centerY, accent, text);
      break;
    case "phoenix":
      drawDragonPhoenix(ctx, w/2, centerY, text, accent);
      break;
    case "floral":
      drawFloralPattern(ctx, w/2, centerY, accent);
      break;
    case "cherry":
      drawCherryBlossom(ctx, w/2, centerY, accent);
      drawCherryBlossom(ctx, w/2+60, centerY-30, accent);
      drawCherryBlossom(ctx, w/2-60, centerY+20, accent);
      break;
    case "leaf":
      drawLeafPattern(ctx, w/2, centerY, accent);
      break;
    case "garden":
      drawLeafPattern(ctx, w/2, centerY-20, accent);
      drawFloralPattern(ctx, w/2, centerY+40, text);
      break;
    case "royal":
      drawRoyalFrame(ctx, w/2-80, centerY-60, 160, 120, accent);
      break;
    case "vintage":
      ctx.fillStyle = text;
      ctx.globalAlpha = 0.1;
      ctx.font = 'italic 10px system-ui';
      ctx.globalAlpha = 1;
      drawRoyalFrame(ctx, w/2-70, centerY-40, 140, 80, accent);
      break;
    case "minimal":
      drawMinimalistLine(ctx, w/2-60, centerY, w/2+60, centerY, accent);
      break;
    case "cute":
      ctx.beginPath();
      ctx.arc(w/2, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
  }

  // ─ Template name ─
  const fontSize = label.length > 18 ? 22 : 28;
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.95;
  ctx.font = `bold ${fontSize}px "system-ui", -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(label, w/2, 500);

  // ─ Subtitle ─
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.6;
  ctx.font = '16px "system-ui", -apple-system, sans-serif';
  ctx.fillText("Thiệp Cưới", w/2, 530);

  // ─ Bottom decoration ─
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w/2-100, 580);
  ctx.lineTo(w/2-30, 580);
  ctx.moveTo(w/2+30, 580);
  ctx.lineTo(w/2+100, 580);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w/2, 580, 6, 0, Math.PI*2);
  ctx.fillStyle = accent;
  ctx.fill();

  // ─ Back to full opacity ─
  ctx.globalAlpha = 1;

  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(OUTPUT_DIR, `${tpl.slug}.webp`);

  // Write as PNG first, then rename (canvas doesn't support webp directly)
  const pngPath = path.join(OUTPUT_DIR, `${tpl.slug}.png`);
  fs.writeFileSync(pngPath, buffer);
  fs.renameSync(pngPath, outputPath);
  console.log(`Created: ${tpl.slug}.webp`);
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return "#" + ((r << 16 | g << 8 | b).toString(16).padStart(6, "0"));
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("Generating themed template placeholders...\n");
TEMPLATES.forEach(tpl => createTemplatePreview(tpl));
console.log("\nDone! Generated 27 theme-matched placeholder images.");
