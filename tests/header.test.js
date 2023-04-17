const puppeteer = require('puppeteer');

test('Launching a browser', async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('localhost:3000');

    const text = await page.$eval('a.brand-logo', () => el => el.innnerHTML);

    expect(text).toEqual('Blogster')
})