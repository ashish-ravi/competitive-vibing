import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';
const BASE = 'http://localhost:3100';

const shots = [
  { name: 'drawer-mobile', url: `${BASE}/dev-preview?view=drawer`, width: 390, height: 844 },
  { name: 'shell-desktop', url: `${BASE}/dev-preview`, width: 1440, height: 900 },
  { name: 'shell-laptop', url: `${BASE}/dev-preview`, width: 1100, height: 800 },
  { name: 'landing-mobile', url: `${BASE}/`, width: 390, height: 844 },
  { name: 'drawer-mobile-dark', url: `${BASE}/dev-preview?view=drawer`, width: 390, height: 844, dark: true },
  { name: 'shell-desktop-dark', url: `${BASE}/dev-preview`, width: 1440, height: 900, dark: true },
  { name: 'roadmap-desktop', url: `${BASE}/dev-preview?view=roadmap`, width: 1280, height: 1400 },
  { name: 'roadmap-desktop-dark', url: `${BASE}/dev-preview?view=roadmap`, width: 1280, height: 1400, dark: true },
  { name: 'roadmap-mobile-dark', url: `${BASE}/dev-preview?view=roadmap`, width: 390, height: 1200, dark: true },
];

const browser = await chromium.launch();
for (const shot of shots) {
  const ctx = await browser.newContext({
    viewport: { width: shot.width, height: shot.height },
    colorScheme: shot.dark ? 'dark' : 'light',
  });
  const page = await ctx.newPage();
  await page.goto(shot.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${shot.name}.png` });
  await ctx.close();
  console.log('shot:', shot.name);
}
await browser.close();
