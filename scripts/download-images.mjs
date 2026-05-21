import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../public/images/template-previews/listing");

const TEMPLATE_SLUGS = [
  "song-long-do",
  "hoa-moc-xanh",
  "long-phung-do",
  "song-phung-do",
  "mai-lan-trang",
  "nhat-binh-do",
  "thanh-diep-xanh",
  "minimalism-do",
  "long-phung-v2-do",
  "song-long-xanh",
  "vuon-xuan-xanh",
  "hoang-kim-do",
  "hoa-moc-hong",
  "chibi-red",
  "song-phung-xanh",
  "anh-dao-hong",
  "long-phung-xanh",
  "vuon-xuan-do",
  "hoa-moc-nau",
  "hoa-lua-nau",
  "vuon-xuan-lam",
  "long-phung-lam",
  "song-long-lam",
  "co-ba-do",
  "long-phung-huyen",
  "hoang-kim-lam",
  "hoang-kim-xanh",
];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadImages() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const results = [];

  for (const slug of TEMPLATE_SLUGS) {
    try {
      console.log(`Crawling: ${slug}`);
      
      const url = `https://chungdoi.com/mau-thiep/${slug}`;
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for images to load
      await new Promise(r => setTimeout(r, 2000));

      // Extract image URLs from the page
      const imageData = await page.evaluate(() => {
        const images = document.querySelectorAll("img");
        const urls = [];
        
        images.forEach((img) => {
          const src = img.src || img.dataset.src;
          if (src && (src.includes("preview") || src.includes("thumb") || src.includes("og-"))) {
            urls.push(src);
          }
        });

        // Check for og:image meta tag
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
        
        return {
          images: urls,
          ogImage: ogImage,
        };
      });

      console.log(`  Found ${imageData.images.length} images`);
      
      // Get the preview image URL
      let previewUrl = null;
      
      // Prefer og:image
      if (imageData.ogImage) {
        previewUrl = imageData.ogImage;
      } else if (imageData.images.length > 0) {
        const previewImages = imageData.images.filter(
          (url) => !url.includes("icon") && !url.includes("logo") && (url.includes("webp") || url.includes("jpg"))
        );
        if (previewImages.length > 0) {
          previewUrl = previewImages[0];
        }
      }

      if (previewUrl) {
        console.log(`  Preview URL: ${previewUrl}`);
        
        // Download the image
        const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);
        const imageBuffer = await page.goto(previewUrl);
        
        if (imageBuffer) {
          fs.writeFileSync(outputPath, await imageBuffer.buffer());
          console.log(`  Saved to: ${outputPath}`);
          results.push({ slug, status: "success", path: outputPath });
        } else {
          console.log(`  Failed to download image`);
          results.push({ slug, status: "failed", error: "No buffer returned" });
        }
      } else {
        console.log(`  No preview URL found`);
        results.push({ slug, status: "failed", error: "No preview URL" });
      }

    } catch (error) {
      console.error(`  Error: ${error.message}`);
      results.push({ slug, status: "failed", error: error.message });
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();

  // Print summary
  console.log("\n=== Download Summary ===");
  const success = results.filter(r => r.status === "success").length;
  const failed = results.filter(r => r.status === "failed").length;
  console.log(`Success: ${success}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log("\nFailed downloads:");
    results.filter(r => r.status === "failed").forEach(r => {
      console.log(`  ${r.slug}: ${r.error}`);
    });
  }

  return results;
}

// Run if called directly
downloadImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { downloadImages };