import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function testRole(email, password, expectedDashboard) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n===', email, '===');

  // 1. Load login page
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');

  const preHeader = await page.locator('header').innerText();
  const hasAccessPortalBefore = preHeader.includes('Access Portal');
  console.log('[1] Header before login has "Access Portal":', hasAccessPortalBefore);

  // 2. Login
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  const urlAfterLogin = page.url();
  console.log('[2] URL after login:', urlAfterLogin);

  const postHeader = await page.locator('header').innerText();
  const hasDashboard = postHeader.includes('Dashboard');
  const hasLogout = postHeader.includes('Log Out');
  const hasAccessPortalAfter = postHeader.includes('Access Portal');
  console.log('[3] Header after login - Dashboard:', hasDashboard, '| Log Out:', hasLogout, '| Access Portal (should be false):', hasAccessPortalAfter);

  // 3. Click Logout
  const logoutBtn = await page.locator('header button', { hasText: 'Log Out' }).first();
  if (await logoutBtn.count() === 0) {
    console.log('[4] FAIL: Log Out button not found in header!');
  } else {
    await logoutBtn.click();
    await page.waitForTimeout(2000);

    const urlAfterLogout = page.url();
    console.log('[4] URL after logout:', urlAfterLogout);

    const logoutHeader = await page.locator('header').innerText();
    const hasAccessPortalAfterLogout = logoutHeader.includes('Access Portal');
    const hasLogoutAfterLogout = logoutHeader.includes('Log Out');
    console.log('[5] Header after logout - Access Portal:', hasAccessPortalAfterLogout, '| Log Out (should be false):', hasLogoutAfterLogout);

    // 4. Try browser back and check protected page
    await page.goBack();
    await page.waitForTimeout(1500);
    const backUrl = page.url();
    console.log('[6] URL after browser Back:', backUrl, '(should redirect to /login if protected)');
  }

  await browser.close();
}

(async () => {
  const roles = [
    { email: 'citizen@gov.in', pass: 'password123', dash: '/citizen' },
    { email: 'univ@gov.in', pass: 'password123', dash: '/university/dashboard' },
    { email: 'industry@gov.in', pass: 'password123', dash: '/industry/dashboard' },
    { email: 'admin@gov.in', pass: 'password123', dash: '/admin' },
  ];

  for (const r of roles) {
    await testRole(r.email, r.pass, r.dash);
  }
  console.log('\n=== All role tests complete ===');
})();
