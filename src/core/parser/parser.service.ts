import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common'
import { Logardian } from 'logardian'
import puppeteer from 'puppeteer'

@Injectable()
export class ParserService {
    private _logger = new Logardian()

    @Cron(CronExpression.EVERY_5_SECONDS)
    async parse() {
        const browser = await puppeteer.launch({})
        const page = await browser.newPage()

        await page.goto('https://garantex.io/p2p?utf8=%E2%9C%93&payment_method=%D0%A2%D0%B8%D0%BD%D1%8C%D0%BA%D0%BE%D1%84%D1%84&amount=200000&currency=RUB&commit=%D0%9F%D0%BE%D0%B8%D1%81%D0%BA')

        let data = []

        const selector = (n: number, m: number) => `#transactions > div > div > table.table.table-condensed.table-striped.sell_table > tbody > tr:nth-child(${n}) > td:nth-child(${m})`
        for(let i = 0; i < 10; i++) {
            const sellerElement = await page.waitForSelector(selector(i, 1))
            const sellerText = await page.evaluate(element => element?.textContent, sellerElement)

                const paymentMethodElement = await page.waitForSelector(selector(i, 2))
                const paymentMethodText = await page.evaluate(element => element?.textContent, paymentMethodElement)

                const priceElement = await page.waitForSelector(selector(i, 3))
                const priceText = await page.evaluate(element => element?.textContent, priceElement)

                const limitElement = await page.waitForSelector(selector(i, 4))
                const limitText = await page.evaluate(element => element?.textContent, limitElement)
                
            data.push({
                seller: sellerText,
                payment_method: paymentMethodText,
                price: priceText,
                limit: limitText
            })
        }
        console.log(data)
        browser.close()
     }
}