const puppeteer = require('puppeteer');

// puppeteer is a Node library which provides a high-level API to control
// Chromium over the DevTools Protocol.
// here we use it to spin up a headless browser and test our React app
test('header renders correctly', async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  // navigate to the app's root URL
  await page.goto('http://localhost:3000');

  // here we select the html element with the class 'brand-logo'
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
});