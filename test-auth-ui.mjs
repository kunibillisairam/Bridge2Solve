import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to signup...');
  await page.goto('http://localhost:3000/signup/citizen');
  
  await page.waitForTimeout(2000); // wait for hydration
  
  console.log('Filling form...');
  await page.fill('input[type="text"][placeholder*="Ramesh"]', 'Test Citizen UI');
  await page.fill('input[type="tel"]', '0987654321');
  await page.fill('input[placeholder*="Karnataka"]', 'Kerala');
  await page.fill('input[placeholder*="Bengaluru"]', 'Kochi');
  await page.fill('input[type="email"]', 'uitest4@gov.in');
  await page.fill('input[type="password"][placeholder*="Minimum"]', 'password123');
  await page.fill('input[type="password"][placeholder*="Repeat"]', 'password123');
  
  console.log('Clicking submit...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for network...');
  await page.waitForTimeout(3000);
  
  const url = page.url();
  console.log('Current URL:', url);
  
  await browser.close();
})();
