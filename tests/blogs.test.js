const Page = require('./helpers/page');

let page;

const myTitle = 'My test title';
const myConent = 'My test content';

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog create form', async () => {
        const label = await page.getContentsOf('form label');

        expect(label).toEqual('Blog title')
    });

    describe('Using valid input', async () => {
        beforeEach(async () => {
            await page.type('.title input', myTitle);
            await page.type('.content input', myConent);
            await page.click('form button')
        })

        test('submiting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries');
        });

        test('submiting then saving adds blogs to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual(myTitle);
            expect(content).toEqual(myConent);
        })
    })

    describe('Using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button')
        })

        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
})

describe('When user is not logged in', async () => {
    test('User cannot create blog post', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('/api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: myTitle, content: myConent })
                }).then(res => res.json());
            }
        );

        expect(result).toEqual({ error: 'You must log in!' })
    });

    test('User cannot get blogs', async () => {
        const result = await page.get('/api/blogs');

        expect(result).toEqual({ error: 'You must log in!' })
    });
})