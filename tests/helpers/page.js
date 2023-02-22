const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

// use case: a way to combine 2 classes without actually changing
// either of them. This is useful when we import a 3rd party library
// we don't want to change the class provided, but we want to add to it

// proxy essentially provides access to multiple classes or objects

class CustomPage {
  // static methods are called without instantiating their class
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      // args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      // target is a reference to customPage, provided above
      get: function (target, property) {
        // the property is whatever is appended to the proxy
        // ex: customPage.helloThere() -> property = helloThere
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    // create a fake user object
    const user = await userFactory();
    // create a fake session object for the user
    const { session, sig } = sessionFactory(user);

    // set the cookies in the browser with puppeteer
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    // refresh the page, to simulate logging in
    await this.page.goto('http://localhost:3000/blogs');

    // check that the logout button is visible
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }
}

module.exports = CustomPage;
