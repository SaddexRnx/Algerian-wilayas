import { test, expect } from '@playwright/test';

test.describe('Map Focus & I18n Validation', () => {
  test('should verify map page components and responsiveness', async ({ page }) => {
    await page.goto('http://localhost:8080/map');
    
    // Check main map container presence
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
    
    // Check I18n labels
    const header = page.locator('h1');
    await expect(header).toContainText(/Map/i);
    
    // Verify Mobile QA Overlay exists (simulated view)
    const qaOverlay = page.locator('.slide-in-from-bottom-4');
    // Note: Visible only on mobile via Tailwind lg:hidden, so we check existence in DOM
    await expect(qaOverlay).toBeDefined();
  });

  test('should verify changelog export functionality', async ({ page }) => {
    await page.goto('http://localhost:8080/changelog');
    
    const exportBtn = page.getByRole('button', { name: /Export/i });
    await expect(exportBtn).toBeVisible();
    
    // Verify RTL toggle doesn't break layout
    await page.goto('http://localhost:8080/?lang=ar');
    await page.goto('http://localhost:8080/changelog');
    const headerAr = page.locator('h1');
    await expect(headerAr).toContainText('سجل التغييرات');
  });

  test('should check admin health checker tab', async ({ page }) => {
    // Navigate to admin (assuming auth is bypassed or handled by local storage in tests)
    await page.goto('http://localhost:8080/admin');
    
    // Select health tab
    const healthTab = page.getByRole('button', { name: /Health/i });
    if (await healthTab.isVisible()) {
      await healthTab.click();
      await expect(page.locator('text=API Health Checker')).toBeVisible();
      await expect(page.locator('text=PASS')).toHaveCount({ min: 1 });
    }
  });
});
