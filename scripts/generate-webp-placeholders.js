const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/images/template-previews/listing');

const COLOR_MAP = {
  "song-long-do": { bg: "#C41E3A", accent: "#FFD700" },
  "long-phung-do": { bg: "#8B0000", accent: "#FFD700" },
  "song-phung-do": { bg: "#DC143C", accent: "#FFD700" },
  "nhat-binh-do": { bg: "#D4A574", accent: "#8B4513" },
  "minimalism-do": { bg: "#FAFAFA", accent: "#C41E3A" },
  "long-phung-v2-do": { bg: "#8B0000", accent: "#FFD700" },
  "hoang-kim-do": { bg: "#3E0001", accent: "#E1BC7C" },
  "chibi-red": { bg: "#C41E3A", accent: "#FFD700" },
  "vuon-xuan-do": { bg: "#228B22", accent: "#C41E3A" },
  "co-ba-do": { bg: "#D4A574", accent: "#8B0000" },
  "long-phung-huyen": { bg: "#1A1A1A", accent: "#E1BC7C" },
  "anh-dao-hong": { bg: "#FFB6C1", accent: "#FF69B4" },
  "hoa-moc-hong": { bg: "#9D6D63", accent: "#F5DEB3" },
  "hoa-moc-xanh": { bg: "#4A7C59", accent: "#8FBC8F" },
  "thanh-diep-xanh": { bg: "#2E8B57", accent: "#90EE90" },
  "song-long-xanh": { bg: "#2E5A4C", accent: "#8FBC8F" },
  "vuon-xuan-xanh": { bg: "#228B22", accent: "#90EE90" },
  "song-phung-xanh": { bg: "#2E8B57", accent: "#FFD700" },
  "long-phung-xanh": { bg: "#2E5A4C", accent: "#E1BC7C" },
  "vuon-xuan-lam": { bg: "#4682B4", accent: "#87CEEB" },
  "long-phung-lam": { bg: "#191970", accent: "#E1BC7C" },
  "song-long-lam": { bg: "#4169E1", accent: "#87CEEB" },
  "hoang-kim-lam": { bg: "#00112E", accent: "#E1BC7C" },
  "mai-lan-trang": { bg: "#FFFAF7", accent: "#404A1D" },
  "hoa-moc-nau": { bg: "#8B7355", accent: "#D2B48C" },
  "hoa-lua-nau": { bg: "#A0522D", accent: "#DEB887" },
  "hoang-kim-xanh": { bg: "#001A08", accent: "#E1BC7C" },
};

function createPlaceholder(slug, colors) {
  const width = 400;
  const height = 711;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.bg);
  gradient.addColorStop(1, colors.accent);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add some decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add template name
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 24px system-ui';
  ctx.textAlign = 'center';
  const name = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  ctx.fillText(name, width / 2, height / 2);

  // Add subtitle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '14px system-ui';
  ctx.fillText('Wedding Template', width / 2, height / 2 + 30);

  // Convert to buffer and save as WebP
  const out = fs.createWriteStream(path.join(OUTPUT_DIR, `${slug}.webp`));
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log(`Created ${slug}.webp`));
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

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("Generating WebP placeholders...");
TEMPLATES.forEach(slug => {
  const colors = COLOR_MAP[slug] || { bg: "#C41E3A", accent: "#FFD700" };
  createPlaceholder(slug, colors);
});

console.log("Done!");
