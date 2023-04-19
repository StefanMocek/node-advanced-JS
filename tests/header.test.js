const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory')

let browser, page;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await browser.close();
});

test('the headerhas the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innnerHTML);

    expect(text).toEqual('Blogster')
});

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/)
});

test('when sign in, shows logout button', async () => {
    const id = '5a85dc351cd349288671a36p';

    const {session, sig} = sessionFactory({user: {_id: id}});

    await page.setCookie({name: 'session', value: session});
    await page.setCookie({name: 'session.sig', value: sig});
    await page.goto('localhost:3000');
    await page.waitFor('a[href="/auth/logout"]');

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innnerHTML);
    expect(text).toEqual('Logout')
})