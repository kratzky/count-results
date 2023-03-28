import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

const sites = ['2captcha.com', 'work2crowd.com', '2yachts.com', 'rucaptcha.com', 'megaindex.com']

puppeteer.launch({
    headless: true,
    devtools: false,
    args: [
        "--lang=en",
        "--disable-site-isolation-trials",
        "--disable-features=site-per-process"
    ]
}).then(async browser => {
    const promises = sites.map(site => {
        return new Promise(async resolve => {
            const page = await browser.newPage()
            await page.goto(`https://www.google.com/search?hl=en&q=site:${site}`)
            await page.waitForSelector('#result-stats')
            const content = await page.$eval('#result-stats', el => el.innerText)
            const re = /\s([0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?|\d*\.\d+|\d+)\s/
            const results = parseInt(content.match(re)[0].trim().replace(',', '').replace('.', ''))
            await page.close()
            resolve({
                site,
                results
            })
        })
    })
    let data = await Promise.all(promises)
    console.table(data)
    await browser.close()
})
