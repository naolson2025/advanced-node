const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
  });
  page = await browser.newPage();
  // navigate to the app's root URL
  await page.goto('http://localhost:3000');
});

// afterEach(async () => {
//   await browser.close();
// });

// puppeteer is a Node library which provides a high-level API to control
// Chromium over the DevTools Protocol.
// here we use it to spin up a headless browser and test our React app
test('header renders correctly', async () => {
  // here we select the html element with the class 'brand-logo'
  const text = await page.$eval('a.brand-logo', (el) => el.innerHTML);
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
  // create a fake user object
  const user = await userFactory();
  // create a fake session object for the user
  const { session, sig } = sessionFactory(user);
  
  // set the cookies in the browser with puppeteer
  await page.setCookie({ name: 'session', value: session });
  await page.setCookie({ name: 'session.sig', value: sig });
  // refresh the page, to simulate logging in
  await page.goto('http://localhost:3000');

  // check that the logout button is visible
  await page.waitFor('a[href="/auth/logout"]');
  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  expect(text).toEqual('Logout');
});
