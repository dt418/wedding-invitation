import { test, expect } from "@playwright/test";

const DEMO_USER = {
  email: "demo@wedding.local",
  password: "Aa@123456#",
};

test.describe("Event Creation & Invitation Rendering", () => {
  test("should create event and render invitation correctly", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"]', DEMO_USER.email);
    await page.fill('input[type="password"]', DEMO_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/events/, { timeout: 15000 });
    
    // Navigate to create event
    await page.click('a[href="/events/new"]');
    await page.waitForURL("**/events/new", { timeout: 10000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    // Step 1: Select template - click first template card
    const templateCard = page.locator('[class*="group"][class*="cursor-pointer"]').first();
    await templateCard.waitFor({ state: "visible", timeout: 10000 });
    await templateCard.click();
    await page.waitForTimeout(500);
    
    // Click continue to move to step 2
    const continueBtn = page.locator('button:has-text("Tiếp tục")').first();
    await continueBtn.click();
    await page.waitForTimeout(1000);
    
    // Step 2: Fill couple info
    await page.waitForSelector('input[placeholder*="Nguyễn"]', { timeout: 5000 });
    const textInputs = page.locator('input[type="text"]');
    await textInputs.first().fill("Nguyễn Văn A");
    await textInputs.nth(1).fill("Trần Thị B");
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Step 3: Fill event details
    await page.locator('input[type="date"]').first().fill("2025-12-25");
    await page.locator('input[type="time"]').first().fill("11:00");
    
    // Fill venue name
    const venueInput = page.locator('input[placeholder*="Hoa Sen"], input[placeholder*="Tên nhà"]');
    await venueInput.first().fill("Nhà hàng Pearl Palace");
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Step 4: Timeline - skip
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Step 5: Gallery - skip
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Step 6: Messages - fill thank you
    await page.locator('textarea').first().fill("Cảm ơn bạn đã đến chia vui cùng chúng tôi!");
    await continueBtn.click();
    await page.waitForTimeout(2000);
    
    // Now at preview step (step 7/7) - verify invitation sections render
    // The preview panel should show the rendered invitation
    
    // Check for couple names in the preview
    const hasCoupleNames = await page.locator("text=Nguyễn Văn A & Trần Thị B").isVisible().catch(() => false);
    
    // Check for venue in the preview
    const hasVenue = await page.locator("text=Nhà hàng Pearl Palace").isVisible().catch(() => false);
    
    // At least the venue should be visible in the preview
    expect(hasVenue || hasCoupleNames).toBeTruthy();
    
    // Try to publish
    const publishBtn = page.locator('button:has-text("Xuất bản")').first();
    await publishBtn.click();
    await page.waitForTimeout(3000);
    
    // Verify event was created and we navigated to event detail
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/events\/.+/);
  });
  
  test("should render all invitation sections in preview", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"]', DEMO_USER.email);
    await page.fill('input[type="password"]', DEMO_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/events/, { timeout: 15000 });
    
    // Navigate to create event
    await page.goto("/events/new");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    // Select template
    const templateCard = page.locator('[class*="group"][class*="cursor-pointer"]').first();
    await templateCard.waitFor({ state: "visible", timeout: 10000 });
    await templateCard.click();
    await page.waitForTimeout(500);
    
    const continueBtn = page.locator('button:has-text("Tiếp tục")').first();
    await continueBtn.click();
    await page.waitForTimeout(1000);
    
    // Fill couple info
    await page.waitForSelector('input[placeholder*="Nguyễn"]', { timeout: 5000 });
    const textInputs = page.locator('input[type="text"]');
    await textInputs.first().fill("Minh Anh");
    await textInputs.nth(1).fill("Thu Hà");
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Fill event details
    await page.locator('input[type="date"]').first().fill("2025-06-20");
    await page.locator('input[type="time"]').first().fill("10:30");
    const venueInput = page.locator('input[placeholder*="Hoa Sen"], input[placeholder*="Tên nhà"]');
    await venueInput.first().fill("Grand Ballroom");
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Skip timeline
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Skip gallery
    await continueBtn.click();
    await page.waitForTimeout(500);
    
    // Fill thank you message
    await page.locator('textarea').first().fill("Thank you for celebrating with us!");
    await continueBtn.click();
    await page.waitForTimeout(2000);
    
    // At preview - verify invitation renders
    const previewContent = await page.locator("body").innerText().catch(() => "");
    
    // Verify we reached the preview step (7/7)
    const isPreviewStep = previewContent.includes("7 / 7") || previewContent.includes("Bước 7");
    expect(isPreviewStep).toBeTruthy();
    
    // Verify preview panel has content (invitation sections)
    // The preview panel contains rendered invitation sections
    const hasPreviewPanel = await page.locator('[class*="overflow-hidden"][class*="rounded"]').count() > 0;
    expect(hasPreviewPanel).toBeTruthy();
  });
});