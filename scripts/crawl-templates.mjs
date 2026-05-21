import puppeteer from "puppeteer";

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

async function crawlTemplateImages() {
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

        // Also check for og:image meta tag
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
        if (ogImage) {
          urls.unshift(ogImage);
        }

        // Check for Next.js image data
        const nextImages = document.querySelectorAll('img[src*="_next"]');
        nextImages.forEach((img) => {
          const src = img.src;
          if (src && !urls.includes(src)) {
            urls.push(src);
          }
        });

        // Get largest image (usually the preview)
        return {
          images: urls,
          ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
        };
      });

      console.log(`  Found ${imageData.images.length} images`);
      
      // Try to find the best preview image
      let previewUrl = null;
      
      // Prefer og:image
      if (imageData.ogImage) {
        previewUrl = imageData.ogImage;
      }
      
      // Or look for template preview in images
      if (!previewUrl && imageData.images.length > 0) {
        // Filter for larger images (likely preview images)
        const previewImages = imageData.images.filter(
          (url) => !url.includes("icon") && !url.includes("logo") && (url.includes("webp") || url.includes("jpg"))
        );
        if (previewImages.length > 0) {
          previewUrl = previewImages[0];
        }
      }

      results.push({
        slug,
        imageUrl: previewUrl,
      });

      console.log(`  Preview: ${previewUrl || "NOT FOUND"}`);

    } catch (error) {
      console.error(`  Error crawling ${slug}:`, error.message);
      results.push({ slug, imageUrl: null });
    }

    // Rate limit
      await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();

  // Print results
  console.log("\n=== Template Image URLs ===");
  results.forEach(({ slug, imageUrl }) => {
    console.log(`${slug}: ${imageUrl || "MISSING"}`);
  });

  return results;
}

// Run if called directly
crawlTemplateImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { crawlTemplateImages };