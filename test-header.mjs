import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async (res) => {
    if (res.url().includes('/api/auth/login')) {
      console.log('Login API Set-Cookie:', await res.headerValue('set-cookie'));
    }
  });

  console.log('Logging in as citizen...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'citizen@gov.in');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000);
  console.log('Current URL after login:', page.url());
  
  await browser.close();
})();
