const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  // navigate to the app's root URL
  await page.goto('http://localhost:3000');
});

// required when headless false
// afterEach(async () => {
//   await browser.close();
// });

// puppeteer is a Node library which provides a high-level API to control
// Chromium over the DevTools Protocol.
// here we use it to spin up a headless browser and test our React app
test('header renders correctly', async () => {
  // here we select the html element with the class 'brand-logo'
  const text = await page.getContentsOf('a.brand-logo');
  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  // the the login flow
  // expect the url to contain the google oauth url
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

// Sign into our app with a fake user
test('when signed in, shows logout button', async () => {
  await page.login();

  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  expect(text).toEqual('Logout');
});
