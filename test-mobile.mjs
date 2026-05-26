import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set mobile viewport
  await page.setViewport({
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Check if MobileNav component exists
    const hasMobileNav = await page.evaluate(() => {
      return !!document.querySelector('[class*="mobileNav"]');
    });
    
    console.log('MobileNav found:', hasMobileNav);
    
    // Take screenshot
    await page.screenshot({ path: 'mobile-screenshot.png' });
    console.log('Screenshot saved to mobile-screenshot.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();
